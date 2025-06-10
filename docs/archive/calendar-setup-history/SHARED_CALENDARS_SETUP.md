# Shared Calendars Setup Guide

## Overview

The AKC CRM system uses **shared Google Calendars** for organizing events:

- **Projects Calendar**: All project-related events (schedule items, milestones, tasks)
- **Work Orders Calendar**: All work order events

## Current Implementation

### Calendar Assignment Logic

```
schedule_item → Projects Calendar
project_milestone → Projects Calendar
project_task → Projects Calendar
work_order → Work Orders Calendar
```

### Required Environment Variables

```env
# Shared calendar IDs (get these from Google Calendar settings)
VITE_GOOGLE_CALENDAR_PROJECTS=<projects-calendar-id>
VITE_GOOGLE_CALENDAR_WORK_ORDER=<work-orders-calendar-id>
```

## Setup Instructions

### 1. Create Shared Calendars in Google

1. **Create Projects Calendar**

   - Go to Google Calendar
   - Click "+" next to "Other calendars"
   - Select "Create new calendar"
   - Name: "AKC Projects"
   - Description: "Shared calendar for all project events"
   - Time zone: Your business timezone
   - Click "Create calendar"

2. **Create Work Orders Calendar**
   - Repeat above steps
   - Name: "AKC Work Orders"
   - Description: "Shared calendar for all work order events"

### 2. Get Calendar IDs

1. In Google Calendar, click the 3 dots next to each calendar
2. Select "Settings and sharing"
3. Scroll to "Integrate calendar"
4. Copy the "Calendar ID" (looks like: `abc123@group.calendar.google.com`)

### 3. Share Calendars with Team

1. In calendar settings, go to "Share with specific people"
2. Add team members with appropriate permissions:
   - **Make changes to events**: For users who create/edit events
   - **See all event details**: For users who only need to view

### 4. Configure Environment

Add to your `.env` file:

```env
VITE_GOOGLE_CALENDAR_PROJECTS=abc123@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=xyz789@group.calendar.google.com
```

### 5. User Authentication

Users must authenticate with Google to create events:

1. User logs into AKC CRM
2. Goes to Settings → Calendar
3. Clicks "Connect Google Calendar"
4. Completes OAuth flow
5. **Important**: The authenticated user must have write access to the shared calendars

## How It Works

1. **User creates a schedule item** → Event goes to Projects Calendar
2. **User creates a work order** → Event goes to Work Orders Calendar
3. **Assignees** → Can be added as attendees (they'll receive invitations)
4. **Calendar visibility** → All team members with calendar access can see events

## Benefits

- **Centralized view**: All project events in one calendar
- **Team collaboration**: Everyone sees the same schedule
- **No personal calendar pollution**: Events don't clutter individual calendars
- **Access control**: Manage who can view/edit via Google Calendar permissions

## Troubleshooting

### "Using primary calendar" Warning

- **Cause**: Environment variables not set
- **Fix**: Add `VITE_GOOGLE_CALENDAR_PROJECTS` and `VITE_GOOGLE_CALENDAR_WORK_ORDER` to `.env`

### 403 Forbidden Error

- **Cause**: User doesn't have write access to shared calendar
- **Fix**: Add user to calendar with "Make changes to events" permission

### Events Not Appearing

- **Check**: User is authenticated (Settings → Calendar shows "Connected")
- **Check**: Shared calendars are visible in user's Google Calendar
- **Check**: Console logs show correct calendar ID being used

## Future Enhancements

1. **Calendar per project** (if needed):

   - Create individual calendars for large projects
   - Store calendar IDs in project records

2. **Service account** (for server-side creation):

   - Events created without user login
   - Better for automated workflows

3. **Calendar templates**:
   - Auto-create project calendars with predefined sharing
