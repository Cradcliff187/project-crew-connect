# Google Calendar Integration Setup Guide

This document provides detailed instructions for setting up and troubleshooting the Google Calendar integration for the AKC Revisions project.

## Prerequisites

- Node.js and npm installed
- PowerShell (for Windows users)
- Access to the project's Google API credentials
- Supabase project access

## Environment Setup

1. **Create the environment file**:
   Use the provided PowerShell script to set up the `.env` file with all required credentials:

   ```bash
   powershell -File tools/setup/create-env.ps1 # UPDATED PATH
   ```

   This will create an `.env` file with:

   - Google API credentials (Client ID, Secret)
   - Supabase connection details
   - Google Calendar IDs for projects and work orders

2. **Verify the environment variables**:
   Make sure the created `.env` file contains all required values:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `GOOGLE_SCOPES`
   - `GOOGLE_APPLICATION_CREDENTIALS`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `PROJECTS_CALENDAR_ID`
   - `WORKORDERS_CALENDAR_ID`

## Starting the Servers

The application requires both frontend and backend servers to be running simultaneously:

1. **Start the backend server**:

   ```bash
   cd server
   node server.js
   ```

   The server should start on port 3000.

2. **Start the frontend server** (in a new terminal window):

   ```bash
   # From project root
   npm run dev
   ```

   The Vite development server should start on port 8081.

3. **Verify both servers are running**:
   - Backend: Open http://localhost:3000 - should see "CRM Live Google Integration Server is running!"
   - Frontend: Open http://localhost:8081 - should display the application UI

## Troubleshooting Common Issues

### 404 Errors for Supabase Functions

If you see errors like `GET_LAST_CALENDAR_SYNC_INFO 404 (Not Found)` in the console:

1. The necessary database functions are missing or have errors

   - Check `supabase/functions` and `db/functions` for correct definitions
   - Ensure functions are deployed to Supabase (via `supabase functions deploy <function_name>`)

2. The client-side code calling the function might have an incorrect function name or parameters.

### Authentication Errors

- **"invalid_grant" or "token has been expired or revoked"**: Your Google OAuth token is invalid.

  - Delete `credentials/google-credentials.json`
  - Re-authenticate through the application's settings page.

- **Service account errors**: Ensure `credentials/calendar-service-account.json` is valid and the service account has permissions on the target calendars.

### Webhook Issues

- **Notifications not received**: Webhooks might not be registered or have expired.

  - Run `node tools/calendar/webhooks/register-calendar-webhook.cjs` # UPDATED PATH
  - Check Supabase logs for the `calendarWebhook` function for errors.

- **Webhook URL**: Ensure the webhook URL in `tools/calendar/webhooks/register-calendar-webhook.cjs` # UPDATED PATH
  points to your deployed Supabase function (e.g., `https://<project_ref>.functions.supabase.co/calendarWebhook`).

## Regular Maintenance

- **Renew webhooks**: Google Calendar webhooks expire. Schedule `tools/calendar/webhooks/scheduled-webhook-renewal.cjs` # UPDATED PATH
  to run daily (e.g., using a cron job or Windows Task Scheduler with `tools/setup/setup-renewal-task.ps1` # UPDATED PATH
  or `tools/setup/setup-user-task.bat`). # UPDATED PATH
- **Monitor logs**: Regularly check application logs and Supabase function logs for any issues.
