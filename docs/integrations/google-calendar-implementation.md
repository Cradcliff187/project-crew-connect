# Google Calendar Integration Implementation

This document outlines the implementation of Google Calendar integration in our CRM application, including the standardized approach and components.

## Overview

We have implemented a comprehensive Google Calendar integration that allows users to sync various entities (project milestones, work orders, contact interactions, and time entries) with their Google Calendar.

## Database Schema

The integration is supported by database tables and fields that track calendar events:

- **Primary Table:** `calendar_events`

  - Maps entities in our application to events in Google Calendar
  - Contains fields for tracking entity type, entity ID, Google Calendar event ID, and sync status

- **Extended Tables:**
  - `project_milestones` - Added `calendar_sync_enabled` and `calendar_event_id` fields
  - `maintenance_work_orders` - Added `calendar_sync_enabled` and `calendar_event_id` fields
  - `contact_interactions` - Added `calendar_sync_enabled` and `calendar_event_id` fields
  - `time_entries` - Added `calendar_sync_enabled` and `calendar_event_id` fields

## Reusable Components

### CalendarIntegrationToggle

We've created a reusable UI component for toggling calendar integration:

```tsx
// src/components/common/CalendarIntegrationToggle.tsx
import { Switch } from '@/components/ui/switch';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Label } from '@/components/ui/label';

interface CalendarIntegrationToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
  description?: string;
}

export function CalendarIntegrationToggle({
  value,
  onChange,
  disabled = false,
  disabledReason,
  label = 'Google Calendar Integration',
  description = 'Add this item to your Google Calendar',
}: CalendarIntegrationToggleProps) {
  const { isAuthenticated } = useGoogleCalendar();

  return (
    <div className="border p-4 rounded-md mt-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="calendar-sync" className="text-base font-medium">
            {label}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Switch
          id="calendar-sync"
          checked={value}
          onCheckedChange={onChange}
          disabled={!isAuthenticated || disabled}
        />
      </div>

      {/* Warnings */}
      {value && disabled && disabledReason && (
        <p className="text-sm text-destructive mt-2">{disabledReason}</p>
      )}

      {value && !isAuthenticated && (
        <p className="text-sm text-amber-500 mt-2">
          You need to connect your Google Calendar in Settings first.
        </p>
      )}
    </div>
  );
}
```

### useCalendarIntegration Hook

We've also created a reusable hook for calendar integration operations:

```tsx
// src/hooks/useCalendarIntegration.ts
import { useState } from 'react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEventData,
} from '@/services/calendarService';
import { useToast } from '@/hooks/use-toast';

export function useCalendarIntegration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, login } = useGoogleCalendar();
  const { toast } = useToast();

  const createEvent = async options => {
    // Implementation details
  };

  const updateEvent = async (eventId, options) => {
    // Implementation details
  };

  const deleteEvent = async eventId => {
    // Implementation details
  };

  return {
    isProcessing,
    isAuthenticated,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
```

## Implementation in Forms

Every form that supports calendar integration follows this standard pattern:

1. Include `calendar_sync_enabled` and `calendar_event_id` fields in the form schema
2. Use the `CalendarIntegrationToggle` component in the form
3. Use the `useCalendarIntegration` hook in the submission handler

Example:

```tsx
// Form Schema
export const workOrderFormSchema = z.object({
  // Other fields...
  scheduled_date: z.date().optional(),
  due_by_date: z.date().optional(),

  // Calendar Integration
  calendar_sync_enabled: z.boolean().default(false),
  calendar_event_id: z.string().optional(),

  // Other fields...
});

// Form Component
<FormField
  control={form.control}
  name="calendar_sync_enabled"
  render={({ field }) => (
    <FormControl>
      <CalendarIntegrationToggle
        value={field.value}
        onChange={field.onChange}
        disabled={!form.watch('scheduled_date')}
        disabledReason="A scheduled date is required for calendar integration"
      />
    </FormControl>
  )}
/>;

// Form Submission
const { createEvent } = useCalendarIntegration();

const handleSubmit = async values => {
  // Create entity in database

  // Add calendar event if needed
  if (values.calendar_sync_enabled && values.scheduled_date) {
    const result = await createEvent({
      title: values.title,
      description: values.description,
      startTime: values.scheduled_date.toISOString(),
      // Other event details...
    });

    // Update entity with calendar_event_id if successful
    if (result.success && result.eventId) {
      await updateEntityWithEventId(entityId, result.eventId);
    }
  }
};
```

## Implemented Components

The Google Calendar integration has been added to the following components:

1. **Settings Page**: `src/components/common/GoogleCalendarSettings.tsx`

   - Handles authentication and user preferences

2. **Project Milestones**: `src/components/projects/milestones/ProjectMilestones.tsx`

   - Calendar sync for project milestones and deadlines

3. **Work Orders**: `src/components/workOrders/dialog/WorkOrderScheduleFields.tsx`

   - Calendar sync for scheduled work orders

4. **Contact Interactions**: `src/components/contacts/detail/InteractionsSection.tsx`

   - Calendar sync for meetings and tasks

5. **Time Entries**: `src/components/timeTracking/TimeEntryForm.tsx`
   - Calendar sync for time entries

## Migration from Inconsistent Implementation

To migrate from the previous inconsistent implementation:

1. **Database Schema**: Ensure all tables have the required fields

   ```sql
   ALTER TABLE IF NOT EXISTS public.[table_name]
   ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
   ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
   ```

2. **Component Refactoring**:

   - Replace custom toggle implementations with `CalendarIntegrationToggle`
   - Update form schemas to include calendar fields
   - Use the `useCalendarIntegration` hook for event operations

3. **Testing**:
   - Verify calendar events are created when entities are created
   - Verify calendar events are updated when entities are updated
   - Verify calendar events are deleted when entities are deleted or sync is disabled
