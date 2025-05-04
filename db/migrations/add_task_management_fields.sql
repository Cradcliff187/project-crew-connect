-- Add task management fields to project_milestones
ALTER TABLE public.project_milestones
ADD COLUMN IF NOT EXISTS assignee_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS assignee_id UUID,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(5,2);

-- Add index for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_milestones_assignee ON public.project_milestones(assignee_type, assignee_id);

-- Create project calendars table
CREATE TABLE IF NOT EXISTS public.project_calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(projectid) ON DELETE CASCADE,
  google_calendar_id TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create calendar access table for employees
CREATE TABLE IF NOT EXISTS public.project_calendar_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_calendar_id UUID NOT NULL REFERENCES public.project_calendars(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  access_level VARCHAR(20) DEFAULT 'read',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_calendar_id, employee_id)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_calendar_project ON public.project_calendars(project_id);
CREATE INDEX IF NOT EXISTS idx_calendar_access_employee ON public.project_calendar_access(employee_id);

-- Enable RLS on the project_calendars table
ALTER TABLE public.project_calendars ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view project calendars
CREATE POLICY "Users can view project calendars"
ON public.project_calendars FOR SELECT
USING (TRUE); -- Anyone can view

-- Create policy to allow users to insert project calendars (should be restricted to project managers in real world)
CREATE POLICY "Users can insert project calendars"
ON public.project_calendars FOR INSERT
WITH CHECK (TRUE);

-- Create policy to allow users to update project calendars (should be restricted to project managers in real world)
CREATE POLICY "Users can update project calendars"
ON public.project_calendars FOR UPDATE
USING (TRUE);

-- Enable RLS on the project_calendar_access table
ALTER TABLE public.project_calendar_access ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view project calendar access
CREATE POLICY "Users can view project calendar access"
ON public.project_calendar_access FOR SELECT
USING (TRUE);

-- Create policy to allow users to insert project calendar access (should be restricted to project managers in real world)
CREATE POLICY "Users can insert project calendar access"
ON public.project_calendar_access FOR INSERT
WITH CHECK (TRUE);

-- Create policy to allow users to update project calendar access (should be restricted to project managers in real world)
CREATE POLICY "Users can update project calendar access"
ON public.project_calendar_access FOR UPDATE
USING (TRUE);

-- Create policy to allow users to delete project calendar access (should be restricted to project managers in real world)
CREATE POLICY "Users can delete project calendar access"
ON public.project_calendar_access FOR DELETE
USING (TRUE);
