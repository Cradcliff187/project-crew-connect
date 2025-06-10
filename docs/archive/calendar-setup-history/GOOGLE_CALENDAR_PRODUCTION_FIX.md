# Google Calendar Production Integration Fix

## Summary

We've removed all mock/stub implementations and connected the frontend to the real Google Calendar API that was already available in production.

## Changes Made

### 1. Removed Mock Endpoints from `server-api-endpoints.cjs`

- Removed mock `/api/google/create-event` endpoint
- Removed mock `/api/google/create-calendar` endpoint
- These were returning fake event IDs and not actually creating calendar events

### 2. Updated `src/lib/calendarService.ts`

- Changed from `/api/google/create-event` to `/api/calendar/events` (real endpoint)
- Updated request payload format to match the real API:
  - `summary` → `title`
  - `start: { dateTime, timeZone }` → `startTime`
  - `end: { dateTime, timeZone }` → `endTime`
- Added entity tracking fields: `entityType`, `entityId`, `projectId`
- Simplified calendar resolution to use "primary" calendar by default

### 3. Updated `src/services/enhancedCalendarService.ts`

- Removed all stub/mock behavior
- Now always calls the real `/api/calendar/events` endpoint
- Properly handles authentication errors and API responses
- Returns actual Google Calendar event IDs

## Real Google Calendar Endpoints Available

The production server already has these real endpoints from `server-google-calendar-auth.cjs`:

### Authentication

- `GET /auth/google` - Start OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### Calendar Operations

- `GET /api/calendar/list` - List user's calendars
- `POST /api/calendar/events` - Create calendar event (with attendees, reminders, colors)
- `PUT /api/calendar/events/:eventId` - Update event
- `DELETE /api/calendar/events/:eventId` - Delete event
- `GET /api/calendar/events` - List events

## Authentication Requirements

Users must be authenticated with Google OAuth to use calendar features:

1. Navigate to Settings → Calendar
2. Click "Connect Google Calendar"
3. Complete OAuth flow
4. Calendar events will then be created in their Google Calendar

## Event Creation Features

The real API supports:

- ✅ Event title, description, location
- ✅ Start/end times with timezone
- ✅ Attendee invitations (employees, subcontractors)
- ✅ Event colors based on entity type
- ✅ Email and popup reminders
- ✅ Auto-creation of Google Meet for multi-attendee events
- ✅ Entity tracking in extended properties

## Testing Checklist

1. **OAuth Flow**

   - [ ] User can connect Google Calendar from settings
   - [ ] Session persists after login
   - [ ] Logout works properly

2. **Schedule Items (from Scheduling Page)**

   - [ ] Creates real Google Calendar events
   - [ ] No more "stub calendar service" warnings
   - [ ] 401 errors resolved (must be logged in)

3. **Project Schedule Items (from Project → Schedule Tab)**

   - [ ] Creates real Google Calendar events
   - [ ] Database column error fixed (`projectname` vs `name`)
   - [ ] Events appear in user's Google Calendar

4. **Work Orders**
   - [ ] Creates events in work order calendar (if configured)
   - [ ] Falls back to primary calendar if not configured
   - [ ] Events have "WO:" prefix in title

## Environment Variables Required

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.run.app/auth/google/callback

# Optional: Specific calendar IDs
VITE_GOOGLE_CALENDAR_WORK_ORDER=calendar-id-for-work-orders
VITE_GOOGLE_CALENDAR_PROJECT=calendar-id-for-projects

# Supabase (for session storage)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Production Deployment

```bash
# 1. Build the application
npm run build

# 2. Deploy via git (preferred method)
git add -A
git commit -m "Fix: Connect to real Google Calendar API"
git push origin main

# CI/CD will automatically deploy to Google Cloud Run
```

## Monitoring

Check for these in the console/logs:

- `🗓️ EnhancedCalendarService: Creating event for: [entity_type]`
- `📅 GOOGLE EVENT CREATION`
- `✅ Google event created with ID: [real-google-event-id]`

No more:

- ❌ "Using stub EnhancedCalendarService"
- ❌ "Mock calendar event creation"
- ❌ 404 errors on `/api/schedule-items`

## Rollback Plan

If issues arise:

1. The mock endpoints are preserved in git history
2. Can temporarily revert `server-api-endpoints.cjs` to add mocks back
3. Frontend can be reverted to use mock endpoints

## Next Steps

1. Monitor production logs for any authentication issues
2. Verify calendar events are appearing in users' Google Calendars
3. Consider implementing calendar selection UI (currently uses "primary")
4. Add calendar event update/delete functionality to UI
