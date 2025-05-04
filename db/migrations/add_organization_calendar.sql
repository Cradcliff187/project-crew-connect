-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.project_calendar_access;
DROP TABLE IF EXISTS public.project_calendars;

-- Create organization-wide calendar table
CREATE TABLE IF NOT EXISTS public.organization_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_calendar_id TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  name TEXT DEFAULT 'Projects Calendar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Access control table for employees
CREATE TABLE IF NOT EXISTS public.calendar_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES public.organization_calendar(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
  access_level VARCHAR(20) DEFAULT 'read',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (calendar_id, employee_id)
);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_calendar_access_employee ON public.calendar_access(employee_id);

-- Enable RLS on the organization_calendar table
ALTER TABLE public.organization_calendar ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view organization calendar
CREATE POLICY "Users can view organization calendar"
ON public.organization_calendar FOR SELECT
USING (TRUE); -- Anyone can view

-- Create policy to allow admins to insert organization calendar (should be restricted to admins in real world)
CREATE POLICY "Admins can insert organization calendar"
ON public.organization_calendar FOR INSERT
WITH CHECK (TRUE);

-- Create policy to allow admins to update organization calendar (should be restricted to admins in real world)
CREATE POLICY "Admins can update organization calendar"
ON public.organization_calendar FOR UPDATE
USING (TRUE);

-- Enable RLS on the calendar_access table
ALTER TABLE public.calendar_access ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view calendar access
CREATE POLICY "Users can view calendar access"
ON public.calendar_access FOR SELECT
USING (TRUE);

-- Create policy to allow admins to manage calendar access (should be restricted to admins in real world)
CREATE POLICY "Admins can manage calendar access"
ON public.calendar_access FOR ALL
USING (TRUE);

-- Keep task management fields for project_milestones
ALTER TABLE public.project_milestones
ADD COLUMN IF NOT EXISTS assignee_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS assignee_id UUID,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(5,2);

-- Add index for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_milestones_assignee ON public.project_milestones(assignee_type, assignee_id);
