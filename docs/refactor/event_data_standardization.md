# Event Data Standardization Plan

## Standardized Event Data Model

Based on the baseline audit, we need to create a unified event model that can represent all calendar event types in the system. The model should be flexible enough to handle various entity types while maintaining consistent fields.

### Proposed TypeScript Interface

```typescript
// Base interface for all calendar events
export interface ICalendarEventBase {
  // Core identification
  id: string; // Unique identifier in our system
  google_event_id: string | null; // Google Calendar's event ID (null if not synced)

  // Calendar integration
  calendar_id: string; // Google Calendar ID where the event exists
  sync_enabled: boolean; // Whether this event should sync with Google Calendar
  last_synced_at: string | null; // ISO timestamp of last sync

  // Core event data
  title: string; // Event title/summary
  description: string | null; // Event description
  start_datetime: string; // ISO timestamp for start
  end_datetime: string; // ISO timestamp for end
  is_all_day: boolean; // Whether this is an all-day event
  location: string | null; // Optional location text

  // Assignee/attendee
  assignee_type: 'employee' | 'subcontractor' | 'vendor' | null;
  assignee_id: string | null; // ID of the assigned person

  // Entity relation (what this event represents)
  entity_type:
    | 'project_milestone'
    | 'schedule_item'
    | 'work_order'
    | 'contact_interaction'
    | 'time_entry';
  entity_id: string; // ID in the source entity table

  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  created_by: string | null; // User ID who created the event
}

// Extended interfaces for specific entity types
export interface IProjectMilestoneEvent extends ICalendarEventBase {
  entity_type: 'project_milestone';
  project_id: string; // Associated project
  // Milestone-specific fields
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'not_started' | 'in_progress' | 'blocked' | 'completed';
}

export interface IScheduleItemEvent extends ICalendarEventBase {
  entity_type: 'schedule_item';
  project_id: string; // Associated project
}

// Other entity-specific interfaces would follow the same pattern
```

## Database Schema Changes

To implement our standardized event model, we'll make the following database changes:

### 1. Create a Unified `calendar_events` Table

```sql
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

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT start_before_end CHECK (start_datetime <= end_datetime),
  CONSTRAINT assignee_consistency CHECK (
    (assignee_type IS NULL AND assignee_id IS NULL) OR
    (assignee_type IS NOT NULL AND assignee_id IS NOT NULL)
  )
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_calendar_events_entity ON public.unified_calendar_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.unified_calendar_events(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_calendar_events_google ON public.unified_calendar_events(google_event_id) WHERE google_event_id IS NOT NULL;
```

### 2. Migration Strategy

To safely migrate to this unified model, we'll:

1. Create the new unified_calendar_events table
2. Copy all existing events from entity-specific tables to the unified table
3. Add triggers to keep data synchronized during the transition period
4. Gradually update application code to use the new table
5. Once all code is updated, remove the duplicate fields from entity tables

### 3. Migration SQL

This will be developed in Phase 1 implementation, migrating data from:

- calendar_events table
- project_milestones
- maintenance_work_orders
- contact_interactions
- time_entries

## Implementation Steps

1. Create TypeScript interfaces in `src/types/calendar.ts`
2. Create database migration for the unified table
3. Write migration script to copy existing data
4. Update calendarService.ts to use the new model
5. Test with a single entity type first (e.g., project_milestones)
6. Expand to other entity types

## Validation Plan

We'll validate the schema changes by:

1. Ensuring all existing calendar events are properly migrated
2. Verifying that Google Calendar sync continues to work
3. Confirming that existing UI components display the data correctly
