-- Migration: update_schedule_items
-- Purpose: Add missing fields to schedule_items table for enhanced functionality

BEGIN;

-- Add new fields to schedule_items table
ALTER TABLE public.schedule_items
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS object_type TEXT DEFAULT NULL;

-- Add index on is_completed for faster querying
CREATE INDEX IF NOT EXISTS idx_schedule_items_is_completed ON public.schedule_items(is_completed);

-- Add comment to explain new fields
COMMENT ON COLUMN public.schedule_items.is_completed IS 'Indicates if the schedule item has been completed';
COMMENT ON COLUMN public.schedule_items.recurrence IS 'JSON object containing recurrence pattern information';
COMMENT ON COLUMN public.schedule_items.object_type IS 'Type of object this schedule item refers to (e.g., task, meeting, milestone)';

COMMIT;
