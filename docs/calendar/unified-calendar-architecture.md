# Unified Calendar Architecture

## Overview

The Unified Calendar Architecture provides intelligent, context-aware calendar integration for construction management workflows. It automatically determines the appropriate calendar(s) and invites based on the context, entity type, and business logic.

## Key Features

- **Context-Aware Calendar Selection**: Automatically chooses between project, work order, and personal calendars
- **Dual Event Strategy**: Creates events on group calendars AND sends individual invites
- **Unified Interface**: Single component handles all scheduling contexts
- **Intelligent Mapping**: Smart logic maps business entities to appropriate calendars

## Architecture Components

### 1. CalendarSelectionService

Determines which calendar(s) to use based on context:

```typescript
import { CalendarSelectionService } from '@/services/calendarSelectionService';

const context = {
  entityType: 'schedule_item',
  projectId: 'project-123',
  assignees: [{ type: 'employee', id: 'emp-1', email: 'john@example.com' }],
  userEmail: 'user@example.com',
};

const selection = await CalendarSelectionService.selectCalendars(context);
// Returns: {
//   primaryCalendar: { id: 'project-calendar-id', type: 'group', name: 'AJC Projects Calendar' },
//   individualInvites: [{ email: 'john@example.com', role: 'assignee', type: 'employee' }]
// }
```

### 2. EnhancedCalendarService

Handles the creation of multiple events and invites:

```typescript
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

const result = await EnhancedCalendarService.createEvent({
  title: 'Project Meeting',
  startTime: '2025-01-20T09:00:00Z',
  endTime: '2025-01-20T10:00:00Z',
  entityType: 'schedule_item',
  entityId: 'schedule-123',
  projectId: 'project-123',
  assignees: [{ type: 'employee', id: 'emp-1', email: 'john@example.com' }],
});

// Creates event on project calendar AND sends invite to john@example.com
```

### 3. UnifiedSchedulingDialog

Standalone component that can be used anywhere:

```typescript
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';

const handleSchedule = () => {
  setSchedulingContext({
    entityType: 'project_milestone',
    projectId: project.id,
    projectName: project.name,
    title: 'Foundation Inspection'
  });
  setSchedulingOpen(true);
};

<UnifiedSchedulingDialog
  open={schedulingOpen}
  onOpenChange={setSchedulingOpen}
  context={schedulingContext}
  onSave={async (eventData) => {
    const result = await EnhancedCalendarService.createEvent(eventData);
    return result.success;
  }}
  onCancel={() => setSchedulingOpen(false)}
/>
```

## Calendar Strategy Matrix

| **Context**                      | **Primary Calendar**                       | **Individual Invites**             | **Use Case**                          |
| -------------------------------- | ------------------------------------------ | ---------------------------------- | ------------------------------------- |
| **Project Schedule Item**        | AJC Projects Calendar                      | Employee/Subcontractor             | Project tracking + personal schedules |
| **Project Milestone**            | AJC Projects Calendar                      | Project team members               | Project management + notifications    |
| **Work Order**                   | Work Orders Calendar                       | Assigned technician                | Work coordination + personal schedule |
| **Work Order (Project-related)** | Work Orders Calendar + AJC Projects        | Assigned technician + project team | Cross-team coordination               |
| **Client Meeting**               | AJC Projects Calendar (if project-related) | Client + attendees                 | Client relations + team coordination  |
| **Personal Task**                | Personal Calendar                          | Optional attendees                 | Individual productivity               |

## Implementation Guide

### Step 1: Project Schedule Items

```typescript
// In project scheduling component
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';

const scheduleProjectItem = (project: Project) => {
  const context = {
    entityType: 'schedule_item' as const,
    projectId: project.id,
    projectName: project.name,
    title: `${project.name} - `, // Pre-fill with project context
  };

  // Open unified scheduling dialog
  setSchedulingContext(context);
  setSchedulingOpen(true);
};

// Result: Event created on AJC Projects Calendar + invites sent to assignees
```

### Step 2: Work Order Scheduling

```typescript
// In work order management
const scheduleWorkOrder = (workOrder: WorkOrder, project?: Project) => {
  const context = {
    entityType: 'work_order' as const,
    workOrderId: workOrder.id,
    workOrderNumber: workOrder.number,
    projectId: project?.id, // If work order is project-related
    projectName: project?.name,
    title: `${workOrder.description}`,
    assignees: workOrder.assignedTechnicians?.map(tech => ({
      type: 'employee' as const,
      id: tech.id,
      email: tech.email,
    })),
  };

  setSchedulingContext(context);
  setSchedulingOpen(true);
};

// Result:
// - Event created on Work Orders Calendar
// - If project-related: ALSO created on AJC Projects Calendar
// - Invites sent to assigned technicians
```

### Step 3: Client Meetings

```typescript
// In client interaction management
const scheduleClientMeeting = (client: Contact, project?: Project) => {
  const context = {
    entityType: 'contact_interaction' as const,
    projectId: project?.id,
    projectName: project?.name,
    title: `Meeting with ${client.name}`,
    assignees: [
      // Include client as attendee
      { type: 'client' as const, id: client.id, email: client.email },
    ],
  };

  setSchedulingContext(context);
  setSchedulingOpen(true);
};

// Result:
// - If project-related: Event on AJC Projects Calendar
// - If not project-related: Event on Personal Calendar
// - Invite sent to client and selected attendees
```

### Step 4: Standalone Employee Scheduling

```typescript
// Standalone scheduling (not tied to specific project/work order)
const scheduleStandaloneEvent = () => {
  const context = {
    entityType: 'personal_task' as const,
    // No project or work order context
  };

  setSchedulingContext(context);
  setSchedulingOpen(true);
};

// Result: Event created on Personal Calendar + invites to selected attendees
```

## Backend Integration

### Required API Endpoints

The Enhanced Calendar Service expects these endpoints:

1. **POST /api/calendar/events** - Create calendar event
2. **POST /api/calendar/invites** - Send individual invite
3. **PUT /api/calendar/events/:id** - Update calendar event
4. **DELETE /api/calendar/events/:id** - Delete calendar event

### Server-side Calendar Helper Updates

Update `server/google-api-helpers/calendar-helper.js` to support the new architecture:

```javascript
// Modified syncScheduleItemWithCalendar to use specific calendar ID
async function syncScheduleItemWithCalendar(authClient, scheduleItem, calendarId) {
  if (!calendarId) {
    throw new Error('Calendar ID is required for schedule item sync');
  }

  // Use the provided calendarId instead of defaulting to 'primary'
  // ... existing implementation
}
```

## Environment Configuration

Ensure these environment variables are set:

```bash
# Group Calendar IDs
GOOGLE_CALENDAR_PROJECT=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com

# Service Account for backend operations
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./credentials/calendar-service-account.json
```

## Migration Strategy

### Phase 1: Update Existing Components

1. Replace existing `ScheduleItemFormDialog` with `UnifiedSchedulingDialog`
2. Update work order forms to use new architecture
3. Migrate client interaction scheduling

### Phase 2: Enhanced Features

1. Add recurring event support
2. Implement calendar conflict detection
3. Add bulk scheduling operations

### Phase 3: Advanced Integration

1. Two-way calendar sync
2. Calendar webhook integration
3. Advanced permission management

## Benefits

1. **Consistency**: All scheduling uses the same interface and logic
2. **Flexibility**: Works across all contexts (projects, work orders, personal)
3. **Intelligence**: Automatically determines appropriate calendars
4. **Scalability**: Easy to add new entity types and calendar logic
5. **User Experience**: Clear preview of where events will be created and who gets invites

## Testing

```typescript
// Test calendar selection logic
import { CalendarSelectionService } from '@/services/calendarSelectionService';

describe('Calendar Selection Service', () => {
  it('should select project calendar for project schedule items', async () => {
    const context = {
      entityType: 'schedule_item',
      projectId: 'test-project',
      assignees: [{ type: 'employee', id: 'emp-1', email: 'test@example.com' }],
    };

    const selection = await CalendarSelectionService.selectCalendars(context);
    expect(selection.primaryCalendar.name).toBe('AJC Projects Calendar');
    expect(selection.individualInvites).toHaveLength(1);
  });
});
```

This unified architecture provides the foundation for sophisticated, context-aware calendar management in your construction management application.
