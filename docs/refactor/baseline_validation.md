# Calendar Integration Baseline Validation

## Current Calendar-Related Files

### Backend Implementation

1. **Google Calendar API Helpers:**

   - `server/google-api-helpers/calendar.js` - Core Google Calendar API integration

2. **Database Migrations:**

   - `db/migrations/add_organization_calendar.sql` - Creates organization calendar and access tables
   - `db/migrations/add_calendar_integration.sql` - Adds calendar event tracking and entity fields
   - `db/migrations/add_calendar_fields_to_time_entries.sql` - Adds calendar fields to time entries

3. **Migration Scripts:**
   - `db/scripts/apply_calendar_migration.js`
   - `db/scripts/apply_organization_calendar_migration.js`

### Frontend Implementation

1. **Calendar Views:**

   - `src/components/projects/calendar/ProjectCalendarView.tsx` - Project-specific calendar view

2. **Services:**

   - `src/services/calendarService.ts` - Frontend service for calendar operations

3. **Types:**

   - `src/types/calendar.ts` - Calendar-related type definitions
   - Fields in various entity types (Projects, Time Entries, etc.)

4. **Hooks:**

   - `src/hooks/useOrganizationCalendar.ts` (inferred)
   - `src/hooks/useCalendarIntegration.ts` (inferred)
   - `src/hooks/useProjectCalendar.ts` (inferred)

5. **Components:**
   - `AssigneeSelector.tsx` (shared component used in calendar events)
   - Various form dialogs with calendar integration

## Current Database Schema

### Organization Calendar Tables

1. **`organization_calendar`**

   - `id` UUID PRIMARY KEY
   - `google_calendar_id` TEXT
   - `is_enabled` BOOLEAN DEFAULT TRUE
   - `name` TEXT DEFAULT 'Projects Calendar'
   - `created_at` TIMESTAMPTZ
   - `updated_at` TIMESTAMPTZ

2. **`calendar_access`**
   - `id` UUID PRIMARY KEY
   - `calendar_id` UUID (References organization_calendar)
   - `employee_id` UUID (References employees)
   - `access_level` VARCHAR(20) DEFAULT 'read'
   - `created_at` TIMESTAMPTZ
   - `updated_at` TIMESTAMPTZ

### Calendar Events Table

**`calendar_events`**

- `id` UUID PRIMARY KEY
- `entity_type` TEXT NOT NULL (Enforced check on allowed types)
- `entity_id` TEXT NOT NULL
- `calendar_event_id` TEXT NOT NULL
- `calendar_id` TEXT NOT NULL DEFAULT 'primary'
- `user_email` TEXT NOT NULL
- `last_synced_at` TIMESTAMPTZ
- `sync_enabled` BOOLEAN DEFAULT TRUE
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

### Entity Tables with Calendar Fields

Various entity tables have calendar-specific fields:

1. **`project_milestones`**

   - `calendar_sync_enabled` BOOLEAN DEFAULT FALSE
   - `calendar_event_id` TEXT

2. **`maintenance_work_orders`**

   - `calendar_sync_enabled` BOOLEAN DEFAULT FALSE
   - `calendar_event_id` TEXT

3. **`contact_interactions`**

   - `calendar_sync_enabled` BOOLEAN DEFAULT FALSE
   - `calendar_event_id` TEXT

4. **`time_entries`**
   - `calendar_sync_enabled` BOOLEAN DEFAULT FALSE
   - `calendar_event_id` TEXT

## API Implementation

The server handles Google Calendar operations through express routes (implied), with a comprehensive helper module in `server/google-api-helpers/calendar.js` that provides:

- Authentication and initialization
- Listing events
- Creating events with metadata
- Updating events
- Deleting events

## Obvious Inconsistencies

1. **Scattered Implementation:**

   - Calendar functionality is spread across multiple components and services
   - No centralized calendar service layer
   - Duplicate logic across different entity types

2. **Schema Inconsistencies:**

   - Different naming conventions (`calendar_sync_enabled` vs. `sync_enabled`)
   - No unified event model across all entity types
   - Mixed approaches between direct fields and reference table

3. **Type Inconsistencies:**

   - Inconsistent TypeScript interfaces across different entities
   - No common base type for calendar events

4. **Component Issues:**

   - AssigneeSelector has dropdown selection issues
   - No reusable calendar view components for different contexts
   - Project-specific calendar views rather than reusable components

5. **Integration Pattern Inconsistencies:**
   - Some components directly call Google APIs
   - Others use intermediate services
   - No clear pattern for error handling or refresh mechanics
