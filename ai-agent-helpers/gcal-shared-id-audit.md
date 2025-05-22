# Google Calendar Shared-ID Validation & Integration Audit Report

## Executive Summary

This report documents the findings and actions taken during the audit of the Google Calendar integration, specifically focusing on the AJC Projects shared calendar ID. The audit identified the storage locations for shared calendar IDs, implemented mechanisms to update them, and documented how these IDs are consumed by the application.

> **AUDIT UPDATE (July 2023)**: Additional components have been identified, and several issues discovered with calendar sync functionality. See the new "Latest Audit Findings" section below for details.

## Findings

### 1. Database Schema

Shared Google Calendar IDs are stored in the following tables:

- **`organization_calendar`**: Stores organization-wide calendar settings, including the Google Calendar ID.
- **`project_calendars`**: Stores project-specific calendar settings.
- **`calendar_access`** / **`project_calendar_access`**: Control access permissions.

### 2. Calendar ID Usage

The Google Calendar ID is used in multiple areas of the codebase:

- **Server API**: The ID is passed to calendar API endpoints in the `calendarId` or `targetCalendarId` parameter.
- **Calendar Helper**: `server/google-api-helpers/calendar.js` accepts a `targetCalendarId` parameter.
- **Frontend Hooks**: Several hooks handle calendar operations, including `useOrganizationCalendar` and `useCalendarIntegration`.

### 3. Current Implementation

- The application primarily uses a single organization-wide shared calendar.
- The calendar ID is retrieved from the database when needed for API calls.
- If no specific calendar ID is provided, the system falls back to the user's primary calendar.

## Fixes Applied

### 1. Server Update Endpoint

Added an endpoint to update or create the organization calendar with the AJC Projects shared calendar ID:

- **Endpoint**: `POST /api/organization-calendar/update`
- **File**: `server/server.js`
- **Functionality**: Checks if an organization calendar exists and updates it, or creates a new one with the AJC Projects calendar ID.

### 2. Utility Script

Created a utility script to facilitate updating the calendar ID:

- **Script**: `ai-agent-helpers/update-ajc-calendar.js`
- **Functionality**: Makes a request to the update endpoint and displays the results.

### 3. Comprehensive Documentation

Created detailed documentation about shared calendar integration:

- **Doc**: `docs/integrations/shared-calendar-usage.md`
- **Content**: Explains where calendar IDs are stored, how they are used, and the overall integration flow.

## Latest Audit Findings (July 2023)

### 1. Additional Calendar-Related Components

| File/Component                                                | Purpose                                                         | Status                                                               | Notes                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `server/server.js` (lines ~1038-1113)                         | Main endpoint handling calendar sync for schedule items         | **Status Updated**: Active but failing                               | Currently returning 500 errors when attempting to sync      |
| `server/google-api-helpers/calendar.js`                       | Google Calendar API utilities                                   | Active                                                               | Core helper library for all calendar operations             |
| `src/components/projects/schedule/hooks/useScheduleItems.tsx` | React hook for managing schedule items, including calendar sync | Active                                                               | Frontend component that calls the failing endpoint          |
| `src/services/calendarService.ts`                             | Frontend service for calendar operations                        | **Status Updated**: Duplicate/overlapping with server implementation | Contains duplicate functionality that may lead to conflicts |
| `tests/services/calendarService.test.ts`                      | Tests for calendar service                                      | Active                                                               | Test coverage for calendar functionality                    |
| `vite.config.ts` (line 29)                                    | Proxy configuration for Google Calendar OAuth                   | Active                                                               | Handles API proxying for OAuth flow                         |
| `env-template.txt`                                            | Environment variables template with Google Calendar settings    | **Status Updated**: May be outdated                                  | Contains different values than server-env.txt               |
| `server-env.txt`                                              | Server environment variables for Google Calendar                | **Status Updated**: May be outdated                                  | May be missing required variables                           |

### 2. New Issues Identified

- **Calendar Sync Failure**: The `/api/schedule-items/{id}/sync-calendar` endpoint is failing with 500 errors.
- **Environment Variable Mismatch**: Discrepancies between environment variable templates and actual values.
- **Duplicate Calendar Service Implementations**: There are overlapping implementations between server-side and client-side code.
- **Database Connection Issues**: The error message suggests problems with Supabase connectivity.

### 3. Preliminary Analysis

- The error message "Failed to fetch schedule item. DB Error: TypeError: fetch failed" indicates a network or connectivity issue when the server tries to fetch data from Supabase.
- The endpoint in `server/server.js` first fetches the schedule item from Supabase, then attempts to sync it with Google Calendar.
- Issues with Supabase client initialization or configuration may be preventing the server from connecting to the database.
- More investigation is needed to pinpoint the exact cause of the failure.

## Next Steps

### 1. Testing

- **Verify Update**: Run the utility script to ensure the AJC Projects calendar ID is properly stored.
- **Event Creation**: Create test events to verify they appear in the shared calendar.
- **Permission Testing**: Verify that all team members can view events in the shared calendar.
- **Status Updated**: Investigate and fix the 500 error in the schedule item sync endpoint.

### 2. Future Improvements

- **UI Enhancements**: Add a settings interface for managing shared calendars.
- **Multiple Calendars**: Enhance the system to better support multiple shared calendars.
- **More Granular Control**: Add settings for notification preferences per calendar.
- **External Sharing**: Add functionality to share calendars with clients or external contractors.
- **Status Updated**: Consolidate duplicate calendar implementations into a single, consistent approach.

## Technical Details

### AJC Projects Shared Calendar ID

```
c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
```

### Key Files

1. **Server API**: `server/server.js`

   - Added endpoint for calendar ID updates
   - Modified to use Supabase client for database operations
   - **Status Updated**: Contains the failing sync-calendar endpoint (lines ~1038-1113)

2. **Database Schema**: `db/migrations/add_organization_calendar.sql`

   - Defines tables for storing calendar IDs and access controls

3. **React Hooks**:

   - `src/hooks/useOrganizationCalendar.ts`
   - `src/hooks/useCalendarIntegration.ts`
   - `src/hooks/useProjectCalendar.ts`
   - **Status Updated**: `src/components/projects/schedule/hooks/useScheduleItems.tsx` (contains calendar sync functionality)

4. **Calendar Helper**: `server/google-api-helpers/calendar.js`

   - Provides methods for interacting with the Google Calendar API
   - Accepts calendar ID parameters

5. **Status Updated - New Files**:
   - `src/services/calendarService.ts` (frontend calendar service)
   - `tests/services/calendarService.test.ts` (tests for calendar service)

## Conclusion

The audit successfully identified how shared Google Calendar IDs are stored and used in the application. The newly implemented endpoint and utility script provide a straightforward way to update the AJC Projects shared calendar ID. The comprehensive documentation will assist team members in understanding and managing the calendar integration.

**Status Updated**: Additional issues have been identified with the calendar sync functionality that require further investigation and resolution. The next phase of this audit will focus on fixing these issues to ensure reliable calendar integration throughout the application.
