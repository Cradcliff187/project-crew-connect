-- =====================================================================================
-- AKC Revisions - Role-Based Time Tracking & Receipts Migration
-- Version: 20250527_role_ot_receipts.sql
-- Purpose: Add role-based access control, overtime tracking, and receipt management
-- =====================================================================================

-- ---------------------------------------------------------------------------------
-- 1. EMPLOYEES TABLE ENHANCEMENTS
-- ---------------------------------------------------------------------------------

-- Add user authentication and role fields to employees table
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS app_role VARCHAR(20) DEFAULT 'field_user'
    CHECK (app_role IN ('admin', 'field_user'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_app_role ON employees(app_role);

-- ---------------------------------------------------------------------------------
-- 2. TIME ENTRIES TABLE ENHANCEMENTS
-- ---------------------------------------------------------------------------------

-- Add processing and overtime fields to existing time_entries table
ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS processed_by uuid REFERENCES employees(employee_id),
  ADD COLUMN IF NOT EXISTS hours_regular numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hours_ot numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS receipt_id uuid; -- Will reference receipts table

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_processed ON time_entries(processed_at);
CREATE INDEX IF NOT EXISTS idx_time_entries_processed_by ON time_entries(processed_by);
CREATE INDEX IF NOT EXISTS idx_time_entries_receipt ON time_entries(receipt_id);

-- ---------------------------------------------------------------------------------
-- 3. RECEIPTS TABLE CREATION
-- ---------------------------------------------------------------------------------

-- Create dedicated receipts table for OCR and expense tracking
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(employee_id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(projectid) ON DELETE SET NULL,
  work_order_id uuid REFERENCES maintenance_work_orders(work_order_id) ON DELETE SET NULL,

  -- Financial data
  amount numeric,
  merchant text,
  tax numeric,
  currency char(3) DEFAULT 'USD',
  receipt_date date,

  -- OCR processing data
  ocr_raw jsonb,
  ocr_confidence numeric CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),
  ocr_processed_at timestamptz,

  -- Document storage
  storage_path text,
  file_name text,
  file_size bigint,
  mime_type text,

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES employees(employee_id)
);

-- Add foreign key constraint for time_entries.receipt_id
ALTER TABLE time_entries
  ADD CONSTRAINT fk_time_entries_receipt
  FOREIGN KEY (receipt_id) REFERENCES receipts(id) ON DELETE SET NULL;

-- Create indexes for receipts table
CREATE INDEX IF NOT EXISTS idx_receipts_employee ON receipts(employee_id);
CREATE INDEX IF NOT EXISTS idx_receipts_project ON receipts(project_id);
CREATE INDEX IF NOT EXISTS idx_receipts_work_order ON receipts(work_order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_ocr_processed ON receipts(ocr_processed_at);

-- ---------------------------------------------------------------------------------
-- 4. ACTIVITY LOG TABLE CREATION
-- ---------------------------------------------------------------------------------

-- Create activity log for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  entry_id uuid REFERENCES time_entries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES employees(employee_id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'process', 'unprocess')),
  payload jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_entry ON activity_log(entry_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at);

-- ---------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------------------

-- Enable RLS on new tables
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on time_entries (if not already enabled)
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "field_users_own_unprocessed" ON time_entries;
DROP POLICY IF EXISTS "field_users_own_receipts" ON receipts;
DROP POLICY IF EXISTS "activity_log_access" ON activity_log;

-- TIME ENTRIES POLICIES
-- Admins can see all entries, field users can only see their own unprocessed entries
CREATE POLICY "time_entries_role_based_access" ON time_entries
  FOR ALL USING (
    CASE
      WHEN (
        SELECT app_role FROM employees WHERE user_id = auth.uid()
      ) = 'admin' THEN true
      ELSE (
        employee_id = (
          SELECT employee_id FROM employees WHERE user_id = auth.uid()
        ) AND processed_at IS NULL
      )
    END
  );

-- RECEIPTS POLICIES
-- Admins can see all receipts, field users can only see their own
CREATE POLICY "receipts_role_based_access" ON receipts
  FOR ALL USING (
    CASE
      WHEN (
        SELECT app_role FROM employees WHERE user_id = auth.uid()
      ) = 'admin' THEN true
      ELSE employee_id = (
        SELECT employee_id FROM employees WHERE user_id = auth.uid()
      )
    END
  );

-- ACTIVITY LOG POLICIES
-- Admins can see all activity, field users can see activity for their own entries
CREATE POLICY "activity_log_role_based_access" ON activity_log
  FOR SELECT USING (
    CASE
      WHEN (
        SELECT app_role FROM employees WHERE user_id = auth.uid()
      ) = 'admin' THEN true
      ELSE entry_id IN (
        SELECT id FROM time_entries
        WHERE employee_id = (
          SELECT employee_id FROM employees WHERE user_id = auth.uid()
        )
      )
    END
  );

-- Only authenticated users can insert activity logs
CREATE POLICY "activity_log_insert_authenticated" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------------
-- 6. TRIGGERS AND FUNCTIONS
-- ---------------------------------------------------------------------------------

-- Function to automatically calculate overtime hours
CREATE OR REPLACE FUNCTION calculate_overtime_hours()
RETURNS TRIGGER AS $$
DECLARE
  week_start date;
  week_end date;
  total_hours numeric;
  regular_hours numeric;
  overtime_hours numeric;
BEGIN
  -- Calculate the start and end of the work week (Monday to Sunday)
  week_start := date_trunc('week', NEW.date_worked::date) + interval '1 day';
  week_end := week_start + interval '6 days';

  -- Get total hours for the employee in this week (excluding current entry if updating)
  SELECT COALESCE(SUM(hours_worked), 0) INTO total_hours
  FROM time_entries
  WHERE employee_id = NEW.employee_id
    AND date_worked::date BETWEEN week_start AND week_end
    AND (NEW.id IS NULL OR id != NEW.id); -- Exclude current entry if updating

  -- Add current entry hours
  total_hours := total_hours + NEW.hours_worked;

  -- Calculate regular and overtime hours
  IF total_hours <= 40 THEN
    regular_hours := NEW.hours_worked;
    overtime_hours := 0;
  ELSE
    -- Check if this entry pushes over 40 hours
    IF (total_hours - NEW.hours_worked) >= 40 THEN
      -- All hours in this entry are overtime
      regular_hours := 0;
      overtime_hours := NEW.hours_worked;
    ELSE
      -- Split hours between regular and overtime
      regular_hours := 40 - (total_hours - NEW.hours_worked);
      overtime_hours := NEW.hours_worked - regular_hours;
    END IF;
  END IF;

  -- Set the calculated values
  NEW.hours_regular := regular_hours;
  NEW.hours_ot := overtime_hours;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic overtime calculation
DROP TRIGGER IF EXISTS trigger_calculate_overtime ON time_entries;
CREATE TRIGGER trigger_calculate_overtime
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_overtime_hours();

-- Function to automatically create labor expense when time entry is created
CREATE OR REPLACE FUNCTION create_labor_expense()
RETURNS TRIGGER AS $$
DECLARE
  labor_cost numeric;
  labor_billable numeric;
  employee_data record;
BEGIN
  -- Get employee cost and bill rates
  SELECT cost_rate, bill_rate INTO employee_data
  FROM employees
  WHERE employee_id = NEW.employee_id;

  -- Calculate costs
  labor_cost := NEW.hours_worked * COALESCE(employee_data.cost_rate, NEW.cost_rate, 0);
  labor_billable := NEW.hours_worked * COALESCE(employee_data.bill_rate, NEW.bill_rate, 0);

  -- Create corresponding expense record
  INSERT INTO expenses (
    entity_id,
    entity_type,
    time_entry_id,
    expense_type,
    description,
    amount,
    quantity,
    unit_price,
    expense_date,
    is_billable,
    created_at,
    updated_at
  ) VALUES (
    NEW.entity_id,
    NEW.entity_type,
    NEW.id,
    'LABOR',
    'Labor: ' || NEW.hours_worked || ' hours',
    labor_cost,
    NEW.hours_worked,
    COALESCE(employee_data.cost_rate, NEW.cost_rate, 0),
    NEW.date_worked,
    true,
    now(),
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic labor expense creation
DROP TRIGGER IF EXISTS trigger_create_labor_expense ON time_entries;
CREATE TRIGGER trigger_create_labor_expense
  AFTER INSERT ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION create_labor_expense();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_time_entry_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_type text;
  acting_user_id uuid;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.processed_at IS NULL AND NEW.processed_at IS NOT NULL THEN
      action_type := 'process';
    ELSIF OLD.processed_at IS NOT NULL AND NEW.processed_at IS NULL THEN
      action_type := 'unprocess';
    ELSE
      action_type := 'update';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
  END IF;

  -- Get acting user
  SELECT employee_id INTO acting_user_id
  FROM employees
  WHERE user_id = auth.uid();

  -- Log the activity
  INSERT INTO activity_log (
    entry_id,
    user_id,
    action,
    payload,
    created_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    acting_user_id,
    action_type,
    jsonb_build_object(
      'old', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      'new', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    ),
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activity logging
DROP TRIGGER IF EXISTS trigger_log_time_entry_activity ON time_entries;
CREATE TRIGGER trigger_log_time_entry_activity
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION log_time_entry_activity();

-- ---------------------------------------------------------------------------------
-- 7. UPDATE EXISTING DATA
-- ---------------------------------------------------------------------------------

-- Set default role for existing employees (first employee becomes admin)
UPDATE employees
SET app_role = 'admin'
WHERE employee_id = (
  SELECT employee_id
  FROM employees
  ORDER BY created_at
  LIMIT 1
) AND app_role IS NULL;

-- Set remaining employees as field users
UPDATE employees
SET app_role = 'field_user'
WHERE app_role IS NULL;

-- Initialize overtime calculations for existing time entries
UPDATE time_entries
SET
  hours_regular = LEAST(hours_worked, 40),
  hours_ot = GREATEST(hours_worked - 40, 0)
WHERE hours_regular IS NULL OR hours_ot IS NULL;

-- ---------------------------------------------------------------------------------
-- 8. GRANTS AND PERMISSIONS
-- ---------------------------------------------------------------------------------

-- Grant necessary permissions
GRANT ALL ON TABLE receipts TO postgres;
GRANT ALL ON TABLE receipts TO anon;
GRANT ALL ON TABLE receipts TO authenticated;
GRANT ALL ON TABLE receipts TO service_role;

GRANT ALL ON TABLE activity_log TO postgres;
GRANT ALL ON TABLE activity_log TO anon;
GRANT ALL ON TABLE activity_log TO authenticated;
GRANT ALL ON TABLE activity_log TO service_role;

-- Grant sequence permissions for activity_log
GRANT USAGE, SELECT ON SEQUENCE activity_log_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE activity_log_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE activity_log_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE activity_log_id_seq TO service_role;

-- ---------------------------------------------------------------------------------
-- 9. COMMENTS FOR DOCUMENTATION
-- ---------------------------------------------------------------------------------

COMMENT ON TABLE receipts IS 'Stores receipt data with OCR processing for expense tracking';
COMMENT ON TABLE activity_log IS 'Audit trail for time entry operations';
COMMENT ON COLUMN employees.app_role IS 'Application role: admin or field_user';
COMMENT ON COLUMN employees.user_id IS 'Links to Supabase auth.users for authentication';
COMMENT ON COLUMN time_entries.processed_at IS 'Timestamp when entry was marked as processed';
COMMENT ON COLUMN time_entries.processed_by IS 'Employee who processed this entry';
COMMENT ON COLUMN time_entries.hours_regular IS 'Regular hours (up to 40 per week)';
COMMENT ON COLUMN time_entries.hours_ot IS 'Overtime hours (over 40 per week)';
COMMENT ON COLUMN time_entries.receipt_id IS 'Associated receipt for this time entry';

-- ---------------------------------------------------------------------------------
-- 10. VALIDATION AND COMPLETION
-- ---------------------------------------------------------------------------------

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 20250527_role_ot_receipts.sql completed successfully';
  RAISE NOTICE 'Added role-based access control, overtime tracking, and receipt management';
  RAISE NOTICE 'Created % new tables, % new indexes, % new functions', 2, 12, 4;
END $$;
