# 📅🔍 360° Calendar & Scheduling Audit Report

## 1. Codebase Discovery & Mapping

### 1.1 Files Related to Calendar/Scheduling Functionality

| File Path                                                     | Modified Date | Keywords                                                           | Description                                                             |
| ------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `src/components/projects/calendar/ProjectCalendarView.tsx`    | N/A           | calendar, startDate, endDate                                       | Main calendar UI component that displays schedule items in a month view |
| `src/components/projects/schedule/hooks/useScheduleItems.tsx` | N/A           | schedule, startDateTime, endDateTime, calendar_integration_enabled | Hook for CRUD operations on schedule items with calendar sync           |
| `src/components/projects/schedule/ScheduleItemFormDialog.tsx` | N/A           | schedule, startDate, endDate, calendar_integration_enabled         | Dialog for creating/editing schedule items                              |
| `src/components/projects/schedule/ProjectScheduleTab.tsx`     | N/A           | calendar, schedule                                                 | Tab component that toggles between list and calendar views              |
| `src/components/projects/milestones/hooks/useMilestones.tsx`  | N/A           | milestone, dueDate, calendar_sync_enabled                          | Hook for CRUD operations on project milestones                          |
| `src/integrations/supabase/types/schedule.ts`                 | N/A           | schedule_items, start_datetime, calendar_integration_enabled       | TypeScript definitions for schedule tables in Supabase                  |
| `src/integrations/supabase/types/calendar.ts`                 | N/A           | calendar, google_calendar_id                                       | TypeScript definitions for calendar tables in Supabase                  |
| `server/google-api-helpers/calendar.js`                       | N/A           | calendar, createEvent, updateEvent                                 | Server-side helpers for Google Calendar integration                     |
| `temp/server-refactor.js`                                     | N/A           | calendar, milestoneId, createEvent                                 | Experimental server-side code with calendar endpoints                   |

### 1.2 Component Dependency Visualization

```
ProjectScheduleTab
├── ProjectMilestones
│   └── useMilestones
├── ProjectCalendarView
│   └── useScheduleItems
│       └── supabase.from('schedule_items')
│
ScheduleItemFormDialog
└── useScheduleItems
    ├── supabase.from('schedule_items')
    └── [API] /api/schedule-items/{id}/sync-calendar
        └── server/google-api-helpers/calendar.js
            └── Google Calendar API
```

## 2. User-Journey Walkthroughs

### 2.1 Create Schedule Item with Calendar Integration

**Starting Point:** Project Schedule Tab > "Add Schedule Item" button

**Sequence:**

1. User clicks "Add Schedule Item" button
2. ScheduleItemFormDialog opens
3. User fills in title, description, start/end dates
4. User assigns a team member
5. User checks "Send Google Calendar invite"
6. User clicks "Add Schedule Item"

**Data Flow:**

- Front-end sends schedule item data to Supabase `schedule_items` table
- If calendar integration enabled:
  - Front-end calls `/api/schedule-items/{id}/sync-calendar`
  - Server uses `google-api-helpers/calendar.js` to create Google Calendar event
  - Google event ID stored back in `schedule_items.google_event_id`

**Success State:** Schedule item created, displayed in calendar view, and Google Calendar event created

**Failure States:**

- Form validation errors (missing fields)
- Supabase write error
- Google API authentication error
- Google Calendar API error

**Test Coverage:** No dedicated tests found for this flow

### 2.2 View Project Calendar

**Starting Point:** Project Schedule Tab > "Calendar View" button

**Sequence:**

1. User navigates to Project detail
2. User selects Schedule tab
3. User clicks "Calendar View" button

**Data Flow:**

- ProjectCalendarView component loads
- useScheduleItems hook fetches from Supabase `schedule_items` table
- Items displayed in monthly calendar grid

**Success State:** Calendar shows all scheduled items for the project

**Failure States:**

- Data loading error from Supabase
- Session timeout/auth error

**Test Coverage:** Partial coverage in `tests/auth/sessionRecovery.test.ts`

### 2.3 Add Project Milestone with Calendar Integration

**Starting Point:** Project Schedule Tab > List View > "Add Milestone" button

**Sequence:**

1. User clicks "Add Milestone" button
2. MilestoneFormDialog opens
3. User fills details and enables calendar sync
4. User submits form

**Data Flow:**

- Front-end writes to Supabase `project_milestones` table
- No clear implementation of calendar sync for milestones, despite UI option

**Success State:** Milestone created and displayed in list

**Failure States:**

- Form validation errors
- Supabase write error

**Test Coverage:** No dedicated tests found

## 3. Static Analysis & Runtime Checks

### 3.1 Type Issues

- **Type Mismatch**: `project_milestones` table schema implies `calendar_sync_enabled` field exists, but no corresponding implementation in server-side code
- **Missing Types**: No explicit interface for `project_milestones` table in Supabase types
- **Type Compatibility**: The `ScheduleItem` interface in `ScheduleItemFormDialog.tsx` partially duplicates `ScheduleItemRow` type from `schedule.ts`

### 3.2 Deprecated APIs

- No explicit use of deprecated libraries for calendar functionality
- Using modern date-fns for date manipulation
- Using Google Calendar v3 API (current version)

### 3.3 Error Handling Issues

- Calendar sync error handling is inconsistent
- No clear retry mechanism for Google API rate limiting
- Error messages not standardized between components

## 4. Supabase Schema Audit

### 4.1 Table: schedule_items

| Column                       | Type      | Nullable | Default            | Constraints                | RLS Policy |
| ---------------------------- | --------- | -------- | ------------------ | -------------------------- | ---------- |
| id                           | uuid      | false    | uuid_generate_v4() | PK                         |            |
| project_id                   | uuid      | false    |                    | FK → projects.projectid    |            |
| title                        | text      | false    |                    |                            |            |
| description                  | text      | true     |                    |                            |            |
| start_datetime               | timestamp | false    |                    |                            |            |
| end_datetime                 | timestamp | false    |                    |                            |            |
| is_all_day                   | boolean   | true     | false              |                            |            |
| assignee_type                | text      | true     |                    |                            |            |
| assignee_id                  | uuid      | true     |                    |                            |            |
| linked_milestone_id          | uuid      | true     |                    | FK → project_milestones.id |            |
| calendar_integration_enabled | boolean   | true     | false              |                            |            |
| google_event_id              | text      | true     |                    |                            |            |
| send_invite                  | boolean   | true     | false              |                            |            |
| invite_status                | text      | true     |                    |                            |            |
| last_sync_error              | text      | true     |                    |                            |            |
| created_at                   | timestamp | false    | now()              |                            |            |
| updated_at                   | timestamp | false    | now()              |                            |            |

**RLS Policy:** `authenticated users can read their associated projects' schedule items`

### 4.2 Table: project_milestones

| Column                | Type      | Nullable | Default            | Constraints             | RLS Policy |
| --------------------- | --------- | -------- | ------------------ | ----------------------- | ---------- |
| id                    | uuid      | false    | uuid_generate_v4() | PK                      |            |
| projectid             | uuid      | false    |                    | FK → projects.projectid |            |
| title                 | text      | false    |                    |                         |            |
| description           | text      | true     |                    |                         |            |
| due_date              | timestamp | true     |                    |                         |            |
| start_date            | timestamp | true     |                    |                         |            |
| is_completed          | boolean   | false    | false              |                         |            |
| status                | text      | true     | 'not_started'      |                         |            |
| priority              | text      | true     | 'medium'           |                         |            |
| estimated_hours       | numeric   | true     |                    |                         |            |
| calendar_sync_enabled | boolean   | true     | false              |                         |            |
| calendar_event_id     | text      | true     |                    |                         |            |
| assignee_type         | text      | true     |                    |                         |            |
| assignee_id           | uuid      | true     |                    |                         |            |
| created_at            | timestamp | false    | now()              |                         |            |
| updated_at            | timestamp | false    | now()              |                         |            |

**RLS Policy:** `authenticated users can read/write milestones for projects they have access to`

### 4.3 Table: organization_calendar

| Column             | Type      | Nullable | Default            | Constraints | RLS Policy |
| ------------------ | --------- | -------- | ------------------ | ----------- | ---------- |
| id                 | uuid      | false    | uuid_generate_v4() | PK          |            |
| google_calendar_id | text      | true     |                    |             |            |
| is_enabled         | boolean   | false    | true               |             |            |
| name               | text      | false    |                    |             |            |
| created_at         | timestamp | false    | now()              |             |            |
| updated_at         | timestamp | false    | now()              |             |            |

**RLS Policy:** `organization admins can read/write calendar settings`

### 4.4 Table: calendar_access

| Column       | Type      | Nullable | Default            | Constraints                   | RLS Policy |
| ------------ | --------- | -------- | ------------------ | ----------------------------- | ---------- |
| id           | uuid      | false    | uuid_generate_v4() | PK                            |            |
| calendar_id  | uuid      | false    |                    | FK → organization_calendar.id |            |
| employee_id  | uuid      | false    |                    | FK → employees.employee_id    |            |
| access_level | text      | false    | 'reader'           |                               |            |
| created_at   | timestamp | false    | now()              |                               |            |
| updated_at   | timestamp | false    | now()              |                               |            |

**RLS Policy:** `users can only see their own calendar access rights`

## 5. Alignment Matrix & Gap Analysis

### 5.1 Front-end to Database Alignment

| Front-end Field                             | DB Column                                     | Type Match? | Tested? | Notes                                          |
| ------------------------------------------- | --------------------------------------------- | ----------- | ------- | ---------------------------------------------- |
| `ScheduleItem.id`                           | `schedule_items.id`                           | ✅          | ❌      |                                                |
| `ScheduleItem.project_id`                   | `schedule_items.project_id`                   | ✅          | ❌      |                                                |
| `ScheduleItem.title`                        | `schedule_items.title`                        | ✅          | ❌      |                                                |
| `ScheduleItem.description`                  | `schedule_items.description`                  | ✅          | ❌      |                                                |
| `ScheduleItem.start_datetime`               | `schedule_items.start_datetime`               | ✅          | ❌      | Handled as Date in UI, string in DB            |
| `ScheduleItem.end_datetime`                 | `schedule_items.end_datetime`                 | ✅          | ❌      | Handled as Date in UI, string in DB            |
| `ScheduleItem.is_all_day`                   | `schedule_items.is_all_day`                   | ✅          | ❌      | Not fully implemented in UI                    |
| `ScheduleItem.assignee_type`                | `schedule_items.assignee_type`                | ⚠️          | ❌      | Limited to 'employee' or 'subcontractor' in FE |
| `ScheduleItem.assignee_id`                  | `schedule_items.assignee_id`                  | ✅          | ❌      |                                                |
| `ScheduleItem.calendar_integration_enabled` | `schedule_items.calendar_integration_enabled` | ✅          | ❌      |                                                |
| `ScheduleItem.google_event_id`              | `schedule_items.google_event_id`              | ✅          | ❌      |                                                |
| `ScheduleItem.send_invite`                  | `schedule_items.send_invite`                  | ✅          | ❌      |                                                |
| `ScheduleItem.invite_status`                | `schedule_items.invite_status`                | ✅          | ❌      | No enum enforcement                            |
| `ProjectMilestone.calendar_sync_enabled`    | `project_milestones.calendar_sync_enabled`    | ✅          | ❌      | UI option exists but no implementation         |
| `ProjectMilestone.calendar_event_id`        | `project_milestones.calendar_event_id`        | ✅          | ❌      | No server-side code to update                  |

### 5.2 Gap Analysis

#### Missing Functionality

1. **Milestone Calendar Sync**: UI option exists but no implementation to sync milestones to Google Calendar
2. **Recurring Events**: No support for repeating calendar events
3. **Calendar Event Colors**: Support exists in API but not in UI
4. **Calendar Notifications**: Limited to Google Calendar defaults, not customizable
5. **Calendar Access Controls**: Tables exist but no UI for managing calendar sharing

#### Type Mismatches

1. **Assignee Types**: Front-end limits `assignee_type` more strictly than database
2. **Date Handling**: Inconsistent date-time formats between components

#### Dead Code

1. `calendar_sync_enabled` in `ProjectMilestone` interface has no implementation
2. `/api/calendar/milestones/:milestoneId` endpoint in `temp/server-refactor.js` - not used

#### Security Concerns

1. Inconsistent RLS policy enforcement - needs comprehensive review
2. No validation of user permissions for calendar operations
3. Possible exposure of Google Calendar event details

#### Testing Gaps

1. No dedicated tests for calendar integration features
2. No tests for offline/fallback behavior
3. No validation of Google Calendar API responses

## 6. Prioritized Findings & Fix Plan

### 6.1 Critical Issues (High Priority)

1. **Incomplete Milestone Calendar Integration**

   - **Issue**: UI shows "Sync with Calendar" option for milestones, but functionality doesn't exist
   - **Impact**: Users expect milestones to sync to calendar but nothing happens
   - **Fix**: Implement calendar sync for milestones using existing Google Calendar API helpers
   - **Effort**: Medium (2-3 days)

2. **Missing Error Handling**

   - **Issue**: Calendar sync failures not properly communicated to users
   - **Impact**: Silent failures or cryptic error messages, users don't know if calendar events were created
   - **Fix**: Standardize error handling, implement proper error notifications, add retry logic
   - **Effort**: Small (1-2 days)

3. **Supabase RLS Policy Gaps**
   - **Issue**: Inconsistent/incomplete RLS policies for calendar-related tables
   - **Impact**: Potential data exposure or unauthorized access
   - **Fix**: Complete security audit, implement proper RLS policies
   - **Effort**: Medium (2-3 days)

### 6.2 Functional Gaps (Medium Priority)

4. **Calendar User Interface Limitations**

   - **Issue**: Calendar view doesn't show multi-day events properly
   - **Impact**: Poor user experience with long-running events
   - **Fix**: Enhance calendar rendering to support multi-day events
   - **Effort**: Medium (2-3 days)

5. **Google Calendar Synchronization Improvements**

   - **Issue**: Changes to Google Calendar events aren't reflected back in the app
   - **Impact**: Out-of-sync data between systems
   - **Fix**: Implement bidirectional sync with Google Calendar webhooks
   - **Effort**: Large (1-2 weeks)

6. **Missing Support for Recurring Events**
   - **Issue**: No way to create repeating schedule items
   - **Impact**: Users need to manually create multiple events for recurring work
   - **Fix**: Add recurrence pattern options to schedule item form
   - **Effort**: Medium (3-4 days)

### 6.3 Technical Debt (Lower Priority)

7. **Type Definition Inconsistencies**

   - **Issue**: Duplicated/inconsistent types between components and database schema
   - **Impact**: Potential bugs during refactoring, difficult maintenance
   - **Fix**: Standardize on Supabase-generated types, remove duplicates
   - **Effort**: Small (1 day)

8. **Test Coverage Gaps**

   - **Issue**: No automated tests for calendar functionality
   - **Impact**: Regressions during changes, difficult to validate fixes
   - **Fix**: Add unit and integration tests for calendar features
   - **Effort**: Medium (3-4 days)

9. **Calendar Settings Management**
   - **Issue**: Calendar access controls schema exists but no UI
   - **Impact**: Can't manage calendar permissions through the application
   - **Fix**: Implement calendar settings screens
   - **Effort**: Medium (3-4 days)

## 7. Implementation Plan

### Phase 1: Critical Fixes (1-2 weeks)

1. **Implement Milestone Calendar Sync**:

   ```
   - Create server endpoint: `POST /api/milestones/:id/sync-calendar`
   - Implement `syncMilestoneToCalendar` function in useCalendar hook
   - Connect UI toggle in MilestoneFormDialog to backend
   - Add UI feedback for successful sync
   ```

2. **Fix Error Handling**:

   ```
   - Standardize error format for calendar operations
   - Add retry logic with exponential backoff
   - Implement user-friendly error messages
   - Add last_sync_status field to track sync state
   ```

3. **Secure RLS Policies**:
   ```
   - Audit all calendar-related table policies
   - Implement row-level security for calendar_access
   - Enforce project-based permissions for schedule_items
   - Add security tests for calendar operations
   ```

### Phase 2: Functional Improvements (2-3 weeks)

4. **Enhance Calendar UI**:

   ```
   - Implement proper multi-day event rendering
   - Add event details popup on click
   - Improve calendar navigation and filtering
   - Support drag-and-drop for event moving
   ```

5. **Two-way Calendar Sync**:

   ```
   - Create webhook endpoint for Google Calendar notifications
   - Implement sync conflict resolution
   - Add background job for periodic sync checks
   - Provide sync status indicators
   ```

6. **Recurring Event Support**:
   ```
   - Expand schedule_items schema to include recurrence pattern
   - Add recurrence UI to ScheduleItemFormDialog
   - Implement recurrence logic in calendar sync
   - Generate expanded views of recurring events
   ```

### Phase 3: Technical Improvements (Ongoing)

7. **Type System Cleanup**:

   ```
   - Generate complete types from Supabase schema
   - Replace custom interfaces with generated types
   - Add strict type validation in API layers
   ```

8. **Test Coverage**:

   ```
   - Add unit tests for calendar and schedule hooks
   - Create integration tests for Google Calendar sync
   - Implement E2E tests for calendar user flows
   ```

9. **Calendar Settings UI**:
   ```
   - Design calendar permissions interface
   - Implement calendar sharing controls
   - Add organization calendar management
   ```
