-- Create calendar events tracking table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  calendar_event_id TEXT NOT NULL,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  user_email TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT entity_type_check CHECK (entity_type IN ('project_milestone', 'work_order', 'contact_interaction', 'estimate'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_entity ON public.calendar_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user ON public.calendar_events(user_email);

-- Add calendar fields to project milestones
ALTER TABLE public.project_milestones
ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Add calendar fields to work orders
ALTER TABLE public.maintenance_work_orders
ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Add calendar fields to contact interactions
ALTER TABLE public.contact_interactions
ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Enable RLS on the calendar_events table
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policy to only allow users to see their own calendar events
CREATE POLICY "Users can view their own calendar events"
ON public.calendar_events FOR SELECT
USING (user_email = auth.jwt() ->> 'email');

-- Create policy to allow users to insert their own calendar events
CREATE POLICY "Users can insert their own calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Create policy to allow users to update their own calendar events
CREATE POLICY "Users can update their own calendar events"
ON public.calendar_events FOR UPDATE
USING (user_email = auth.jwt() ->> 'email');

-- Create policy to allow users to delete their own calendar events
CREATE POLICY "Users can delete their own calendar events"
ON public.calendar_events FOR DELETE
USING (user_email = auth.jwt() ->> 'email');
