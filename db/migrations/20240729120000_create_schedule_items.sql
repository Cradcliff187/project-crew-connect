-- Migration: create_schedule_items
-- Purpose: Create table for specific, timed schedule entries with assignee and calendar integration fields.

BEGIN;

-- Create the schedule_items table
CREATE TABLE public.schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL, -- Keep as TEXT to match projects.projectid
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  -- Assignee Details (using TEXT for assignee_id to accommodate potential source types)
  assignee_type TEXT CHECK (assignee_type IN ('employee', 'subcontractor')),
  assignee_id TEXT,
  -- Optional Link to General Task/Milestone
  linked_milestone_id UUID NULL,
  -- Calendar Integration Details
  calendar_integration_enabled BOOLEAN DEFAULT FALSE,
  google_event_id TEXT NULL,
  send_invite BOOLEAN DEFAULT FALSE,
  invite_status TEXT NULL,
  last_sync_error TEXT NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Foreign Key constraint for project_id
  CONSTRAINT fk_project
    FOREIGN KEY(project_id)
    REFERENCES public.projects(projectid)
    ON DELETE CASCADE,

  -- Foreign Key constraint for linked_milestone_id (optional link)
  CONSTRAINT fk_milestone
    FOREIGN KEY(linked_milestone_id)
    REFERENCES public.project_milestones(id)
    ON DELETE SET NULL,

  -- Constraint to ensure end >= start
  CONSTRAINT end_datetime_after_start_datetime CHECK (end_datetime >= start_datetime),
  -- Constraint to ensure assignee details are consistent
  CONSTRAINT assignee_check CHECK (
    (assignee_type IS NULL AND assignee_id IS NULL) OR
    (assignee_type IS NOT NULL AND assignee_id IS NOT NULL)
  )
);

-- Grant usage for the new table
GRANT ALL ON TABLE public.schedule_items TO postgres;
GRANT ALL ON TABLE public.schedule_items TO anon;
GRANT ALL ON TABLE public.schedule_items TO authenticated;
GRANT ALL ON TABLE public.schedule_items TO service_role;

-- Trigger function for updated_at (assuming it doesn't exist or needs update)
-- If `moddatetime` function already exists and is suitable, this can be omitted.
CREATE OR REPLACE FUNCTION public.moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the column exists before trying to assign to it
    IF TG_OP = 'UPDATE' THEN
        IF NEW ? 'updated_at' THEN
          NEW.updated_at = now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid errors, then recreate
DROP TRIGGER IF EXISTS handle_updated_at ON public.schedule_items;
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.schedule_items
  FOR EACH ROW EXECUTE PROCEDURE public.moddatetime ();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_schedule_items_project_datetime ON public.schedule_items(project_id, start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_schedule_items_assignee ON public.schedule_items(assignee_type, assignee_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_milestone_link ON public.schedule_items(linked_milestone_id);

-- Enable RLS
ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Example: Allow full access for authenticated users - refine as needed)
-- Drop policy if exists to avoid error on re-run
DROP POLICY IF EXISTS "Allow all access for authenticated users on schedule_items" ON public.schedule_items;
CREATE POLICY "Allow all access for authenticated users on schedule_items"
  ON public.schedule_items
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.schedule_items IS 'Stores specific, timed schedule entries for projects, distinct from general milestones.';
COMMENT ON COLUMN public.schedule_items.assignee_id IS 'Stores UUID for employee or TEXT subid for subcontractor, based on assignee_type.';
COMMENT ON COLUMN public.schedule_items.linked_milestone_id IS 'Optional link to a general task/milestone in project_milestones.';

COMMIT;
