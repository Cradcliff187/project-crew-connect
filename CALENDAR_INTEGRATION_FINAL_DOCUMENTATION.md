# Calendar Integration - Final Working Documentation

## Overview

The AKC CRM uses Google Calendar integration with **shared calendars** for projects and work orders. Events are created by a service account, not individual users.

## Architecture

### Shared Calendars

- **Projects Calendar**: `c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com`
- **Work Orders Calendar**: `c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com`

### Service Account

- **Email**: `project-crew-connect@crm-live-458710.iam.gserviceaccount.com`
- **Permissions**: "Make changes to events" on both shared calendars

## Critical Configuration

### 1. Frontend Environment Variables (Build-Time)

The frontend needs calendar IDs at **build time**, not runtime. This is achieved through:

#### Dockerfile (CRITICAL)

```dockerfile
# Set calendar IDs as build-time environment variables
ENV VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
ENV VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com

# Build the application
RUN npm run build
```

#### vite.config.ts

```typescript
define: {
  // Pass calendar IDs to frontend during build
  'import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS': JSON.stringify(
    process.env.VITE_GOOGLE_CALENDAR_PROJECTS ||
    'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com'
  ),
  'import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER': JSON.stringify(
    process.env.VITE_GOOGLE_CALENDAR_WORK_ORDER ||
    'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com'
  ),
},
```

### 2. Backend Configuration

#### Cloud Run Secrets (via cloudbuild.yaml)

```yaml
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=google-service-account-credentials:latest'
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_EMAIL=google-service-account-email:latest'
- '--update-secrets'
- 'VITE_GOOGLE_CALENDAR_PROJECTS=vite-google-calendar-projects:latest'
- '--update-secrets'
- 'VITE_GOOGLE_CALENDAR_WORK_ORDER=vite-google-calendar-work-order:latest'
```

#### Service Account Authentication (server-service-account.cjs)

The backend uses service account credentials to authenticate with Google Calendar API.

## Event Flow

1. **Frontend** (`src/services/enhancedCalendarService.ts`):

   - Determines calendar based on entity type
   - Sends request to `/api/calendar/events`

2. **Backend** (`server-api-endpoints.cjs`):

   - Authenticates using service account
   - Creates event in appropriate shared calendar
   - Returns event ID to frontend

3. **Calendar Selection**:
   - Schedule items → Projects Calendar
   - Projects → Projects Calendar
   - Work orders → Work Orders Calendar

## Testing Checklist

✅ No "VITE_GOOGLE_CALENDAR_PROJECTS/PROJECT not configured" warnings
✅ Events appear in shared calendars (not personal calendar)
✅ Console shows "Using Projects Calendar (c_9922...)" not "primary"
✅ Service account creates all events

## Troubleshooting

### If Calendar IDs Not Found in Frontend

1. Check Dockerfile has ENV statements before `RUN npm run build`
2. Verify vite.config.ts has the define section
3. Rebuild and redeploy

### If Events Go to Wrong Calendar

1. Verify service account has permissions on shared calendars
2. Check entity type mapping in enhancedCalendarService.ts

## Local Development Setup

Add to `.env`:

```
GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_SERVICE_ACCOUNT_EMAIL=project-crew-connect@crm-live-458710.iam.gserviceaccount.com
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
```

## DO NOT CHANGE

- Calendar IDs in Dockerfile
- Build-time ENV placement in Dockerfile
- Service account email
- vite.config.ts define section
