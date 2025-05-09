-- Migration: create_unified_calendar_events
-- Purpose: Create a unified table for all calendar events and migrate existing data

BEGIN;

-- Create the unified calendar events table
CREATE TABLE IF NOT EXISTS public.unified_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core event data
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT FALSE,
  location TEXT,

  -- Google Calendar integration
  google_event_id TEXT,
  calendar_id TEXT NOT NULL DEFAULT 'primary',
  sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,

  -- Assignee data
  assignee_type TEXT CHECK (assignee_type IN ('employee', 'subcontractor', 'vendor')),
  assignee_id TEXT,

  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project_milestone', 'schedule_item', 'work_order', 'contact_interaction', 'time_entry')),
  entity_id TEXT NOT NULL,

  -- Additional common identifiers
  project_id TEXT, -- For project-related events (schedule items, milestones, etc.)

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT start_before_end CHECK (start_datetime <= end_datetime),
  CONSTRAINT assignee_consistency CHECK (
    (assignee_type IS NULL AND assignee_id IS NULL) OR
    (assignee_type IS NOT NULL AND assignee_id IS NOT NULL)
  ),

  -- Unique constraint to prevent duplicates
  CONSTRAINT unique_entity_calendar_event UNIQUE (entity_type, entity_id, google_event_id)
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_calendar_events_entity ON public.unified_calendar_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.unified_calendar_events(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_events_google ON public.unified_calendar_events(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_project ON public.unified_calendar_events(project_id) WHERE project_id IS NOT NULL;

-- Migrate existing data from calendar_events table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calendar_events') THEN
    INSERT INTO public.unified_calendar_events (
      title,
      description,
      start_datetime,
      end_datetime,
      google_event_id,
      calendar_id,
      sync_enabled,
      last_synced_at,
      entity_type,
      entity_id,
      created_at,
      updated_at
    )
    SELECT
      'Event from ' || ce.entity_type AS title, -- Default title based on entity type
      'Migrated from legacy calendar_events table' AS description,
      now() AS start_datetime, -- Default to current time
      now() + interval '1 hour' AS end_datetime, -- Default to 1 hour duration
      ce.calendar_event_id AS google_event_id,
      ce.calendar_id,
      ce.sync_enabled,
      ce.last_synced_at,
      ce.entity_type,
      ce.entity_id,
      ce.created_at,
      ce.updated_at
    FROM
      public.calendar_events ce
    WHERE
      NOT EXISTS (
        SELECT 1 FROM public.unified_calendar_events uce
        WHERE uce.entity_type = ce.entity_type
        AND uce.entity_id = ce.entity_id
        AND (
          (uce.google_event_id IS NULL AND ce.calendar_event_id IS NULL) OR
          uce.google_event_id = ce.calendar_event_id
        )
      );
  END IF;
END $$;

-- Migrate data from project_milestones
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_milestones') THEN
    INSERT INTO public.unified_calendar_events (
      title,
      description,
      start_datetime,
      end_datetime,
      google_event_id,
      sync_enabled,
      entity_type,
      entity_id,
      project_id,
      created_at,
      updated_at
    )
    SELECT
      pm.title,
      pm.description,
      COALESCE(pm.start_date, pm.due_date) AS start_datetime,
      COALESCE(pm.due_date, pm.start_date + interval '1 day') AS end_datetime,
      pm.calendar_event_id,
      COALESCE(pm.calendar_sync_enabled, FALSE) AS sync_enabled,
      'project_milestone' AS entity_type,
      pm.id::text AS entity_id,
      pm.projectid AS project_id,
      pm.created_at,
      pm.updated_at
    FROM
      public.project_milestones pm
    WHERE
      pm.calendar_event_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.unified_calendar_events uce
        WHERE uce.entity_type = 'project_milestone'
        AND uce.entity_id = pm.id::text
      );
  END IF;
END $$;

-- Add triggers to keep unified_calendar_events in sync with entity tables
-- This is a temporary measure during the transition period

-- Function to update unified_calendar_events when a project milestone is updated
CREATE OR REPLACE FUNCTION public.update_milestone_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
  -- If calendar sync is enabled, ensure there's a corresponding unified calendar event
  IF NEW.calendar_sync_enabled = TRUE THEN
    -- Insert or update the unified calendar event
    INSERT INTO public.unified_calendar_events (
      title,
      description,
      start_datetime,
      end_datetime,
      google_event_id,
      sync_enabled,
      entity_type,
      entity_id,
      project_id,
      created_at,
      updated_at
    ) VALUES (
      NEW.title,
      NEW.description,
      COALESCE(NEW.start_date, NEW.due_date), -- Use start_date if available, fallback to due_date
      COALESCE(NEW.due_date, NEW.start_date + interval '1 day'), -- Use due_date if available, fallback to start_date + 1 day
      NEW.calendar_event_id,
      NEW.calendar_sync_enabled,
      'project_milestone',
      NEW.id::text,
      NEW.projectid,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (entity_type, entity_id, COALESCE(google_event_id, '')) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      start_datetime = EXCLUDED.start_datetime,
      end_datetime = EXCLUDED.end_datetime,
      google_event_id = EXCLUDED.google_event_id,
      sync_enabled = EXCLUDED.sync_enabled,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project_milestones
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'project_milestones'
  ) THEN
    DROP TRIGGER IF EXISTS update_milestone_calendar_event_trigger ON public.project_milestones;

    CREATE TRIGGER update_milestone_calendar_event_trigger
    AFTER INSERT OR UPDATE OF title, description, start_date, due_date, calendar_sync_enabled, calendar_event_id
    ON public.project_milestones
    FOR EACH ROW
    WHEN (NEW.calendar_sync_enabled = TRUE)
    EXECUTE FUNCTION public.update_milestone_calendar_event();
  END IF;
END $$;

-- Enable Row-Level Security on the unified_calendar_events table
ALTER TABLE public.unified_calendar_events ENABLE ROW LEVEL SECURITY;

-- Default policies for the unified_calendar_events table
CREATE POLICY "Users can view calendar events" ON public.unified_calendar_events
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert calendar events" ON public.unified_calendar_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own calendar events" ON public.unified_calendar_events
    FOR UPDATE USING (
        created_by = auth.uid() OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can delete their own calendar events" ON public.unified_calendar_events
    FOR DELETE USING (
        created_by = auth.uid() OR
        auth.role() = 'service_role'
    );

-- Add automatic updated_at timestamp handling
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.unified_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON TABLE public.unified_calendar_events TO postgres;
GRANT ALL ON TABLE public.unified_calendar_events TO anon;
GRANT ALL ON TABLE public.unified_calendar_events TO authenticated;
GRANT ALL ON TABLE public.unified_calendar_events TO service_role;

COMMIT;
