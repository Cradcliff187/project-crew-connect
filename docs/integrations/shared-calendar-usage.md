# Shared Google Calendar Integration

This document provides details on how shared Google Calendars are integrated into the application, including where calendar IDs are stored and how they are used.

## Overview

The application supports both user-specific calendar integrations (using a user's own Google Calendar) and shared organization-wide calendars that multiple users can access. Shared calendars allow events to be visible to all relevant team members, regardless of who created them.

## Database Schema

Shared calendar IDs are stored in the following database tables:

### `organization_calendar`

This table stores organization-wide calendar settings:

| Column             | Type        | Description                                           |
| ------------------ | ----------- | ----------------------------------------------------- |
| id                 | UUID        | Primary key for the calendar entry                    |
| google_calendar_id | TEXT        | The Google Calendar ID string for the shared calendar |
| is_enabled         | BOOLEAN     | Whether the calendar is active                        |
| name               | TEXT        | Display name for the calendar                         |
| created_at         | TIMESTAMPTZ | Creation timestamp                                    |
| updated_at         | TIMESTAMPTZ | Last update timestamp                                 |

### `project_calendars`

For project-specific shared calendars:

| Column             | Type        | Description                                            |
| ------------------ | ----------- | ------------------------------------------------------ |
| id                 | UUID        | Primary key for the calendar entry                     |
| project_id         | UUID        | Reference to projects.projectid                        |
| google_calendar_id | TEXT        | The Google Calendar ID string for the project calendar |
| is_enabled         | BOOLEAN     | Whether the calendar is active                         |
| created_at         | TIMESTAMPTZ | Creation timestamp                                     |
| updated_at         | TIMESTAMPTZ | Last update timestamp                                  |

### `calendar_access` / `project_calendar_access`

These tables control which employees have access to which calendars:

| Column                            | Type        | Description                                                   |
| --------------------------------- | ----------- | ------------------------------------------------------------- |
| id                                | UUID        | Primary key for the access entry                              |
| calendar_id / project_calendar_id | UUID        | Reference to organization_calendar.id or project_calendars.id |
| employee_id                       | UUID        | Reference to employees.employee_id                            |
| access_level                      | VARCHAR(20) | Access level ('read', 'write', 'admin')                       |

## AJC Projects Shared Calendar

The organization has a shared Google Calendar for AJC Projects with the following ID:

```
c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
```

This calendar ID is stored in the `organization_calendar` table and can be updated using the API endpoint:

```
POST /api/organization-calendar/update
```

A utility script is also available to update this ID:

```
node ai-agent-helpers/update-ajc-calendar.js
```

## Technical Implementation

### Calendar ID Flow

1. **Storage**: Calendar IDs are stored in Supabase tables (`organization_calendar` and/or `project_calendars`).
2. **Retrieval**: When a calendar event is created/updated, the appropriate calendar ID is fetched from the database.
3. **API Calls**: The calendar ID is passed to the Google Calendar API as the `calendarId` parameter.

### Code Implementation

The following components are key to the calendar ID integration:

#### Server-side (Express)

1. **Calendar Helper**: `server/google-api-helpers/calendar.js`

   - Contains methods for creating, updating, and deleting calendar events
   - Accepts `targetCalendarId` parameter to specify which calendar to use

2. **API Endpoints**: `server/server.js`
   - Several endpoints handle calendar operations
   - The endpoint `/api/organization-calendar/update` manages the shared calendar ID

#### Frontend

1. **Organization Calendar Hook**: `src/hooks/useOrganizationCalendar.ts`

   - Provides methods to fetch, create, and update organization calendars
   - Used by settings and admin components

2. **Calendar Integration Hook**: `src/hooks/useCalendarIntegration.ts`

   - High-level hook for calendar event management
   - Uses the calendar ID when creating/updating events

3. **Project Calendar Hook**: `src/hooks/useProjectCalendar.ts`
   - Similar to the organization hook but for project-specific calendars

## Event Creation Process

When creating a calendar event:

1. The frontend calls the relevant API endpoint (e.g., `/api/calendar/events`)
2. The server determines the appropriate calendar ID:
   - If a specific ID is provided in the request, it uses that
   - Otherwise, it checks if a project-specific calendar should be used
   - If no specific calendar is indicated, it falls back to the organization's shared calendar
   - If no shared calendar exists, it uses the user's primary calendar ('primary')
3. The server then calls the Google Calendar API with the selected calendar ID

## Adding a New Shared Calendar

To add a new shared calendar to the system:

1. Create the calendar in Google Calendar and get its ID.
2. Insert a new record into the `organization_calendar` or `project_calendars` table.
3. Assign appropriate access permissions in the `calendar_access` or `project_calendar_access` table.
4. Update any relevant code to use the new calendar ID as needed.

## Troubleshooting

If calendar events are not appearing in the expected calendars:

1. Verify the calendar ID is correctly stored in the database.
2. Check if the user has proper permissions to access the calendar.
3. Inspect the server logs for Google API errors.
4. Confirm the OAuth scopes include `https://www.googleapis.com/auth/calendar`.

## Future Improvements

Potential enhancements for the calendar integration:

1. Add UI for managing multiple shared calendars
2. Implement color-coding for events from different sources
3. Support for calendar-specific notifications preferences
4. Calendar sharing outside the organization
