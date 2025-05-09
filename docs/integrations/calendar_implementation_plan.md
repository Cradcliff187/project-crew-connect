# Google Calendar Integration Implementation Plan

## Overview

This plan outlines our approach to implementing an organization-wide Google Calendar integration with unified components for work orders and projects. The implementation includes standardized event handling, two-way sync, attendee management, and cost tracking.

## Requirements

### Calendars in Scope

- **AKC Projects Calendar**: `c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com`
- **AKC Work Order Calendar**: `c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com`
- **Individual Employee Calendars**: Each employee's primary calendar

### Authentication Model

- **Service Account** with writer ACL on both shared group calendars for server-side writes
- **Per-user OAuth 2.0** (`calendar.events` scope) for personal calendar access
- Fallback to Service Account if user doesn't authorize OAuth

### Event Handling

- **Daily Expansion**: Multi-day events create one event per day (no RRULE)
- **Extended Properties** to track entity IDs and rate information
- **Consistent Event Format** across entity types with standardized summary, description, and location fields
- **External Attendees** with optional notification control

### Two-Way Sync

- **Push Notification Channels** for real-time updates
- **Sync Tokens** for efficient incremental sync
- **ETag-Based Conflict Detection** with manual resolution UI

## Implementation Timeline

### Phase 1: Database & Infrastructure (Week 1)

| Task                       | Description                                             | Days | Dependencies  |
| -------------------------- | ------------------------------------------------------- | ---- | ------------- |
| **Schema Design**          | Define and create tables for assignments and sync state | 2    | None          |
| **RPC Functions**          | Create Supabase RPC functions for calendar operations   | 2    | Schema Design |
| **RLS Policies**           | Set up row-level security policies for new tables       | 1    | Schema Design |
| **Service Account Setup**  | Configure GCP Service Account with proper permissions   | 2    | None          |
| **API Endpoints Planning** | Document required API endpoints and parameters          | 1    | None          |

### Phase 2: Core Services (Week 2)

| Task                          | Description                                                              | Days | Dependencies          |
| ----------------------------- | ------------------------------------------------------------------------ | ---- | --------------------- |
| **Calendar Service Refactor** | Update googleCalendarService.ts with entity-specific calendar resolution | 2    | Phase 1               |
| **Authentication Strategy**   | Implement dual-auth strategy (OAuth + Service Account)                   | 2    | Service Account Setup |
| **Event Mapping**             | Create standardized event mapping with extended properties               | 2    | None                  |
| **Daily Event Expansion**     | Implement logic to expand multi-day events                               | 1    | Event Mapping         |
| **Unit Tests**                | Create comprehensive test suite for the service layer                    | 3    | All Phase 2 tasks     |

### Phase 3: UI Components (Week 3)

| Task                             | Description                                           | Days | Dependencies                          |
| -------------------------------- | ----------------------------------------------------- | ---- | ------------------------------------- |
| **UnifiedCalendarForm**          | Create a shared form component for calendar events    | 2    | None                                  |
| **AttendeeSelector**             | Build attendee management component with RSVP display | 2    | None                                  |
| **WorkOrderCalendarForm**        | Create work order specific calendar implementation    | 1    | UnifiedCalendarForm, AttendeeSelector |
| **ProjectCalendarForm**          | Create project specific calendar implementation       | 1    | UnifiedCalendarForm, AttendeeSelector |
| **External Notification Toggle** | Implement toggle for external attendee notifications  | 1    | AttendeeSelector                      |
| **Component Unit Tests**         | Test UI components in isolation                       | 2    | All UI Components                     |

### Phase 4: Synchronization (Week 4)

| Task                        | Description                                          | Days | Dependencies            |
| --------------------------- | ---------------------------------------------------- | ---- | ----------------------- |
| **Sync Token Management**   | Implement storage and retrieval of sync tokens       | 1    | Phase 1                 |
| **Push Notification Setup** | Create webhook endpoints for calendar notifications  | 2    | Sync Token Management   |
| **Incremental Sync**        | Build efficient incremental sync engine              | 2    | Sync Token Management   |
| **Conflict Resolution**     | Create conflict detection and resolution flow        | 2    | Incremental Sync        |
| **Sync Worker**             | Build background worker for processing notifications | 2    | Push Notification Setup |
| **Integration Tests**       | Test end-to-end synchronization flows                | 2    | All Phase 4 tasks       |

### Phase 5: Cost Tracking & Finalization (Week 5)

| Task                      | Description                                   | Days | Dependencies        |
| ------------------------- | --------------------------------------------- | ---- | ------------------- |
| **Rate Storage**          | Implement rate storage in assignments table   | 1    | Phase 1             |
| **Cost Calculation**      | Create helper functions for cost calculations | 2    | Rate Storage        |
| **Reporting Integration** | Connect calendar-based costs to reporting     | 2    | Cost Calculation    |
| **E2E Testing**           | Comprehensive end-to-end testing              | 3    | All previous phases |
| **Documentation**         | Complete technical and user documentation     | 2    | All components      |
| **Deployment Planning**   | Create detailed deployment guide              | 1    | All components      |

## Detailed Component Specifications

### Database Schema

```sql
-- New tables
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT CHECK (entity_type IN ('work_order','project','ad_hoc')),
  entity_id UUID NOT NULL,
  assignee_id UUID NOT NULL,
  calendar_id TEXT NOT NULL,
  google_event_id TEXT NOT NULL,
  etag TEXT,
  start_date DATE NOT NULL,
  rate_per_hour NUMERIC(10,2),
  last_synced_at TIMESTAMPTZ
);

CREATE TABLE sync_cursors (
  calendar_id TEXT PRIMARY KEY,
  next_sync_token TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Service Layer Methods

```typescript
// Calendar resolution
async getEntityCalendarId(entityType: EntityType): Promise<string>

// Authentication strategies
async getAuthStrategy(entityType: EntityType): Promise<'oauth' | 'service_account'>

// CRUD operations
async createEvent(eventData: CreateCalendarEventInput): Promise<CalendarEventResponse>
async updateEvent(eventId: string, updateData: UpdateCalendarEventInput): Promise<CalendarEventResponse>
async deleteEvent(eventId: string): Promise<CalendarEventResponse>
async listEvents(startTime: string, endTime: string, entityType?: EntityType): Promise<ICalendarEventBase[]>

// Sync operations
async performTwoWaySync(calendarId: string): Promise<TwoWaySyncResult>
async setupPushNotifications(calendarId: string, webhookUrl: string): Promise<{ success: boolean, channelId: string }>
```

### UI Components

```typescript
// Unified calendar form for all entity types
<UnifiedCalendarForm
  open={boolean}
  onOpenChange={(open: boolean) => void}
  initialData={CalendarFormData}
  onSave={(data: CalendarFormData) => Promise<boolean>}
  onCancel={() => void}
  title={string}
  description={string}
  entityType={EntityType}
  entityId={string}
  showAttendees={boolean}
/>

// Attendee selector with RSVP status
<AttendeeSelector
  attendees={EventAttendee[]}
  onChange={(attendees: EventAttendee[]) => void}
  entityType={EntityType}
  entityId={string}
  disabled={boolean}
  maxAttendees={number}
/>
```

## Testing Strategy

### Unit Tests

- Service layer methods in isolation
- UI components with mock data
- Database functions and procedures

### Integration Tests

- OAuth and Service Account authentication flows
- Event CRUD operations with Google Calendar API
- Two-way sync with simulated changes

### End-to-End Tests

- Complete user flows (create → sync → edit → sync)
- Time zone handling and DST transitions
- External notification paths

## Open Questions

1. **Rate Handling**: How should we handle rate changes over time? Should historical rates be preserved?
2. **Sync Frequency**: How often should we poll for changes if push notifications fail?
3. **Conflict Resolution UI**: Who should be notified of conflicts and how should they be presented?
4. **Error Recovery**: What's the escalation path if synchronization issues persist?
5. **Permission Model**: How do we handle visibility of cost information in shared calendars?

## Next Steps

1. Finalize database schema design
2. Set up GCP project and service account
3. Begin implementation of core service layer components
4. Schedule check-in after Phase 2 to validate approach
