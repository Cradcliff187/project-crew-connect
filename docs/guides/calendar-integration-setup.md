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
   powershell -File tools/setup/create-env.ps1
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
2. Fix by applying the database migration:

   ```bash
   # From project root
   node db/scripts/migration-runner.cjs db/migrations/fix_calendar_sync_functions.sql
   ```

### Circular Reference in SQL Functions

If PostgreSQL functions are recursively calling each other causing stack overflow errors:

1. Drop and recreate both functions:

   ```sql
   -- Drop both functions to break the recursive calls
   DROP FUNCTION IF EXISTS public.get_last_calendar_sync_info(text);
   DROP FUNCTION IF EXISTS public.rpc_get_last_calendar_sync_info(text);

   -- Create the implementation and RPC functions properly
   -- See db/migrations/fix_calendar_sync_functions.sql for full implementation
   ```

### Authentication Failures

If Google authentication is failing:

1. Verify the OAuth consent screen is configured correctly
2. Check that the redirect URI in the Google Cloud Console matches your local development environment
3. Verify that all required scopes are enabled in the Google Cloud Console
4. Clear browser cookies/local storage and try authenticating again

## Required Database Tables

The calendar integration requires these database tables:

1. `sync_cursors` - Tracks calendar sync status
2. `push_notification_channels` - Manages webhook notification channels for real-time updates

If these tables don't exist, run the setup migration:

```bash
node db/scripts/migration-runner.cjs db/migrations/create_sync_tables.sql
```

## Testing the Integration

After setup, test the integration by:

1. Open the application at http://localhost:8081
2. Navigate to Settings > Google Calendar
3. Connect your Google account
4. Create a test event
5. Verify the event appears in both the application and Google Calendar

## Useful Commands

- Check if servers are running: `netstat -ano | findstr ":8080 :8081 :3000" | findstr "LISTENING"`
- Kill a specific process: `taskkill /F /PID <pid>`
- View running Node.js processes: `Get-Process node`
