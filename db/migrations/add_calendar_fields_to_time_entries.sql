-- Add calendar integration fields to time_entries table
-- Consolidates changes from various standalone SQL files
ALTER TABLE public.time_entries
ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_calendar_sync ON public.time_entries(calendar_sync_enabled)
WHERE calendar_sync_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_time_entries_calendar_event ON public.time_entries(calendar_event_id)
WHERE calendar_event_id IS NOT NULL;

-- Update the calendar_events constraint to allow time entries
ALTER TABLE public.calendar_events
DROP CONSTRAINT IF EXISTS entity_type_check;

ALTER TABLE public.calendar_events
ADD CONSTRAINT entity_type_check
CHECK (entity_type IN ('project_milestone', 'work_order', 'contact_interaction', 'estimate', 'time_entry'));
