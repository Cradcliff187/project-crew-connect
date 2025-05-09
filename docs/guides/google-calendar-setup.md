# Google Calendar Integration Setup

This document outlines the steps taken to fix the Google Calendar integration issues and provides guidance on maintaining the integration.

## 🔶 Fix Summary

The following items were addressed to restore Google Calendar functionality:

1. Created proper `.env` template file with all required environment variables
2. Fixed calendarWebhook Supabase Edge Function
3. Created database function for handling calendar sync operations
4. Added RLS policies for calendar-related tables
5. Updated calendar settings to use the shared calendars
6. Set up test scripts for validation

## 🔶 Files Changed

| File                                        | Change                                                        |
| ------------------------------------------- | ------------------------------------------------------------- |
| `env-template.txt`                          | Created with all required environment variables               |
| `supabase/functions/calendarWebhook.ts`     | Updated environment variable handling                         |
| `src/services/googleCalendarService.ts`     | Added support for environment variables for calendar IDs      |
| `server/server.js`                          | Fixed OAuth client configuration to use environment variables |
| `credentials/calendar-service-account.json` | Added template for service account credentials                |
| `test-calendar-integration.js`              | Created to validate calendar integration                      |
| `register-calendar-webhook.js`              | Created to set up webhook notifications                       |

## 🔶 Database Changes

1. Created `sync_calendar_changes` function to handle synchronization
2. Added RLS policies for calendar tables to allow service role access
3. Updated calendar settings with the shared calendar IDs
4. Initialized sync cursors for webhooks

## 🔶 Environment Variables

The following environment variables need to be set in your `.env` file:

```
# Supabase Configuration
SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY
SUPABASE_PROJECT_ID=zrxezqllmpdlhiudutme

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar
GOOGLE_APPLICATION_CREDENTIALS=./credentials/calendar-service-account.json

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
CLIENT_SECRET=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
REDIRECT_URI=http://localhost:8080/auth/google/callback

# Shared Google Calendars
GOOGLE_CALENDAR_PROJECT=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com

# Webhook Configuration
WEBHOOK_URL=https://zrxezqllmpdlhiudutme.functions.supabase.co/calendarWebhook
```

## 🔶 Google Cloud Configuration

Ensure the following APIs are enabled in your Google Cloud project:

1. Google Calendar API
2. Cloud Functions
3. Cloud Scheduler

## 🔶 Service Account Setup

1. Upload your `calendar-service-account.json` file to the `credentials` directory
2. The service account should have permissions to access the shared calendars
3. Share the calendars with the service account email: `calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com`

## 🔶 Testing the Integration

### 1. Testing Event Creation

Run the test script to create events and verify webhooks:

```bash
node test-calendar-integration.js
```

### 2. Testing Webhook Registration

Register webhooks to receive notifications for calendar changes:

```bash
node register-calendar-webhook.js
```

**Note:** Webhooks expire after 7 days and need to be re-registered.

## 🔶 Troubleshooting

If you encounter issues:

1. Check that all environment variables are set correctly
2. Verify the service account has access to the calendars
3. Check Supabase logs for webhook errors using:
   ```bash
   supabase functions logs calendarWebhook
   ```
4. Ensure the required Google APIs are enabled
5. Verify RLS policies allow the service to access calendar tables

## 🔶 Maintenance

### Regular Tasks

1. Re-register webhooks before they expire (every 7 days)
2. Monitor Supabase logs for errors
3. Check that calendar events are being properly synchronized

### Updating Calendar IDs

If calendar IDs change:

1. Update the `.env` file with new IDs
2. Run `node register-calendar-webhook.js` to register webhooks for the new calendars
3. Update the settings in Supabase with the new calendar IDs
