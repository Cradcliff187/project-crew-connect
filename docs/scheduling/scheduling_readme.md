# Scheduling Kit & Calendar Integration Documentation

## Overview

This document outlines the architecture and usage of the reusable scheduling kit within the application. The system is event-centric, with `schedule_items` as the single source of truth for all scheduled events, tasks, meetings, and milestones. It supports integration with Google Calendar for two-way synchronization.

## Core Concepts

- **`schedule_items` Table**: The central Postgres table storing all scheduling data. See `db/migrations/` for the latest schema.
  - Key new fields:
    - `is_completed` (boolean): Tracks if an item is done.
    - `recurrence` (jsonb): Stores recurrence rules (see `RecurrencePattern` below).
    - `object_type` (text): Categorizes the item (e.g., 'task', 'meeting', 'milestone').
- **Event-Centric Design**: All schedulable entities are treated as `ScheduleItem` objects.
- **Google Calendar Sync**: Two-way synchronization is handled via `calendarService.ts` and a backend webhook.

## Frontend Structure

### 1. Main UI Components (`src/components/scheduling/`)

- **`ProjectCalendarView.tsx`**:

  - Provides a full calendar (monthly, weekly, daily views) using a basic custom grid for now.
  - Displays `ScheduleItem` data.
  - Supports:
    - Viewing multi-day events.
    - Displaying recurring events (basic indication).
    - Visually distinguishing completed items.
  - Props: `scheduleItems`, `onItemClick`, `onDateClick`, `onAddClick`.

- **`TimelineView.tsx`**:

  - Offers a list-based timeline/Gantt-style representation of `ScheduleItem` objects.
  - Supports grouping by `day`, `week`, `status`, `assignee`, or `object_type`.
  - Highlights completed items and indicates multi-day spans.
  - Props: `scheduleItems`, `groupBy`, `startDate`, `endDate`, `onItemClick`.

- **`ScheduleItemFormDialog.tsx`** (`src/components/projects/schedule/`):
  - A dialog for creating and editing `ScheduleItem` objects.
  - Uses the `ScheduleItem` type from `src/types/schedule.ts`.

### 2. Core Types (`src/types/schedule.ts`)

- **`ScheduleItem`**: The primary interface for all scheduled events. Includes all fields from the `schedule_items` table.
- **`RecurrencePattern`**: Defines the structure for the `recurrence` JSONB field.
  - `frequency`: 'daily', 'weekly', 'monthly', 'yearly'
  - `interval` (optional): Number of periods between occurrences.
  - `weekDays` (optional): Array of weekdays (e.g., ['MO', 'TU']) for weekly recurrence.
  - `monthDay` (optional): Day of the month for monthly recurrence.
  - `endDate` (optional): ISO date string for when recurrence ends.
  - `count` (optional): Number of occurrences.
- **`ScheduleObjectType`**: A union type for allowed `object_type` values (e.g., 'task', 'meeting').

### 3. Services & Hooks

- **`calendarService.ts`** (`src/services/`):

  - **Factory Function**: `createCalendarService(googleClient?, options?)` allows injecting a Google Calendar client implementation (for easier testing and flexibility) or using a default.
  - **`createOrUpdateEvent(scheduleItem, calendarId?)`**: Saves/updates a `ScheduleItem` and syncs it to Google Calendar if `calendar_integration_enabled` is true. Handles new vs. existing Google events.
  - **`handleGoogleWebhook(payload, projectId)`**: Processes incoming webhook notifications from Google Calendar. It fetches the event from Google, converts it to a `Partial<ScheduleItem>`, and is intended to be used by the backend to update the `schedule_items` table.
  - **`deleteEvent(scheduleItem, calendarId?)`**: Deletes an event from Google Calendar.
  - **Helper Functions**: `scheduleItemToGoogleEvent` and `googleEventToScheduleItem` for data transformation.

- **`useScheduleItems.tsx`** (`src/components/projects/schedule/hooks/`):
  - React hook for fetching, adding, updating, and deleting `ScheduleItem` objects from the Supabase `schedule_items` table.
  - Uses the updated `ScheduleItem` type.

## Backend Structure

- **Webhook Handler** (`server/api/google/webhook.ts`):
  - Receives POST requests from Google Calendar for event changes.
  - Validates payload and uses `calendarService.handleGoogleWebhook` to get a `Partial<ScheduleItem>`.
  - Updates or creates corresponding records in the `schedule_items` table in Supabase.
  - Handles deletion of events synced from Google.

## Database

- **`schedule_items` table**: As described in Core Concepts.
- **Migrations**:
  - `db/migrations/20240729120000_create_schedule_items.sql`
  - `db/migrations/20240801000000_update_schedule_items.sql`
- **Supabase Types**:
  - `src/integrations/supabase/types.ts` (main generated types, now includes `schedule_items` with new fields).
  - `src/integrations/supabase/types/schedule.ts` (module augmentation for `schedule_items`).

## How to Schedule an Item (Example)

Here's how a new module can schedule an item in two lines of code (frontend example using the hook):

```typescript
// 1. Import the hook and necessary types
import { useScheduleItems } from '@/components/projects/schedule/hooks/useScheduleItems';
import { ScheduleItem } from '@/types/schedule';

function MyModuleComponent({ projectId }: { projectId: string }) {
  const { addScheduleItem, loading, error } = useScheduleItems(projectId);

  const handleCreateNewEvent = async () => {
    const newItemData: Partial<ScheduleItem> = {
      title: 'New Event from My Module',
      description: 'Details about this new event.',
      start_datetime: new Date().toISOString(),
      end_datetime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
      object_type: 'task',
      calendar_integration_enabled: true, // Optional: to sync with Google Calendar
      send_invite: true, // Optional: to send invites if an assignee is set
      // assignee_id: 'user@example.com', // Optional
      // assignee_type: 'employee', // Optional
    };

    // 2. Call the addScheduleItem function
    const createdItem = await addScheduleItem(newItemData);

    if (createdItem) {
      console.log('Successfully scheduled item:', createdItem);
    } else {
      console.error('Failed to schedule item:', error);
    }
  };

  return (
    <button onClick={handleCreateNewEvent} disabled={loading}>
      Schedule New Item
    </button>
  );
}
```

This example demonstrates creating a new `ScheduleItem` and adding it to the Supabase database via the `useScheduleItems` hook. If `calendar_integration_enabled` is true, the `calendarService` (used internally by the hook or a similar backend mechanism) would attempt to sync it with Google Calendar.
