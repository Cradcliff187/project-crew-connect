
-- Create a function to update work order status without triggering activitylog insertion
CREATE OR REPLACE FUNCTION public.update_work_order_status_bypass_log(
  p_work_order_id UUID, 
  p_status TEXT
) 
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
BEGIN
  -- Update the status directly
  UPDATE public.maintenance_work_orders
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE work_order_id = p_work_order_id;

  -- Return success if the row was updated
  GET DIAGNOSTICS success = ROW_COUNT;
  RETURN success > 0;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to public
GRANT EXECUTE ON FUNCTION public.update_work_order_status_bypass_log TO PUBLIC;

-- Add a function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.check_column_exists(
  table_name TEXT,
  column_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = check_column_exists.table_name
      AND column_name = check_column_exists.column_name
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function to public
GRANT EXECUTE ON FUNCTION public.check_column_exists TO PUBLIC;

-- Add pdf_document_id column to estimate_revisions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'estimate_revisions'
      AND column_name = 'pdf_document_id'
  ) THEN
    ALTER TABLE public.estimate_revisions ADD COLUMN pdf_document_id UUID REFERENCES public.documents(document_id);
  END IF;
END $$;
