# AI Agent Guide for Starting AKC Revisions Development Environment

This guide is specifically written for AI assistants to help users start the AKC Revisions application for testing and development.

## 1. Environment Verification

First, check if the .env file exists and has all required variables:

```bash
# Check if .env file exists
if (Test-Path -Path '.env') {
    Write-Host ".env file exists" -ForegroundColor Green
} else {
    Write-Host ".env file does not exist" -ForegroundColor Red
    Write-Host "Creating .env file..."
    if (Test-Path -Path 'tools/setup/create-env.ps1') {
        powershell -File tools/setup/create-env.ps1
    } else {
        Write-Host "create-env.ps1 not found. Creating .env manually..."
        # Create a basic .env file
        @"
SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY
GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
GOOGLE_MAPS_API_KEY=AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I
PROJECTS_CALENDAR_ID=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
WORKORDERS_CALENDAR_ID=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
"@ | Out-File -FilePath '.env'
    }
}
```

## 2. Starting the Backend Server

**CRITICAL: The backend server MUST be started from the project root directory**

The backend provides the API for Google Calendar, Maps, and other integrations.

```powershell
# In Windows PowerShell, execute:
cd "C:\Dev\AKC Revisions-V1"  # Adjust this path to the user's actual location
node server/server.js
```

You should see output like:

```
DEBUG: Loaded Env Vars:
  GOOGLE_CLIENT_ID: Loaded
  GOOGLE_CLIENT_SECRET: Loaded
  GOOGLE_REDIRECT_URI: Loaded
  GOOGLE_MAPS_API_KEY: Loaded
  SUPABASE_URL: Loaded
  SUPABASE_SERVICE_ROLE_KEY: Loaded
----------------------------------------
Attempting to start server on port 3000...
Server started successfully
Backend server listening on http://localhost:3000
```

If you see "MISSING" for any environment variables, suggest the user add them to the .env file.

## 3. Starting the Frontend Server

In a second terminal:

```powershell
# In Windows PowerShell, execute:
cd "C:\Dev\AKC Revisions-V1"  # Adjust this path to the user's actual location
npm run dev
```

You should see output like:

```
VITE v5.4.x ready in xxx ms
➜ Local: http://localhost:8080/
➜ Network: http://xxx.xxx.xxx.xxx:8080/
```

## 4. Common Issues and Solutions

### Backend Server Issues

1. **`supabaseKey is required`**

   - Problem: The .env file isn't being loaded properly
   - Solution:
     ```powershell
     # Make sure you're in the project root directory
     cd "C:\Dev\AKC Revisions-V1"
     # Edit server/server.js to move dotenv.config() to the top before any client initialization
     ```

2. **Server starts but immediately exits**

   - Problem: The server isn't staying running
   - Solution: Use the updated server.js with error handlers and keep-alive logic

3. **GOOGLE_MAPS_API_KEY is missing**
   - Solution: Add it to .env:
     ```powershell
     echo "GOOGLE_MAPS_API_KEY=AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I" >> .env
     ```

### Frontend Server Issues

1. **Cannot find module**

   - Problem: Dependencies may not be installed
   - Solution:
     ```powershell
     npm install
     ```

2. **Port 8080 already in use**
   - Solution:
     ```powershell
     # Find and kill the process using port 8080
     netstat -ano | findstr :8080
     # Then kill the process ID (PID)
     taskkill /F /PID <PID>
     ```

## 5. Verifying Application is Working

1. Open a browser and go to http://localhost:8080
2. The application should load and display the main interface
3. To test Google Calendar integration:
   - Navigate to Settings > Google Calendar
   - Connect your Google account
   - The app should redirect to Google's authentication page

## 6. Checking Server Status

If either server stops responding, check if they're still running:

```powershell
Get-Process node | Select-Object Id, StartTime, CPU, NPM | Format-Table
```

To restart a server that has crashed, follow steps 2 or 3 again.

## 7. For Debugging Issues

1. Checking which ports are in use:

   ```powershell
   netstat -ano | findstr ":3000 :8080"
   ```

2. Database migration issues:

   - If you see 404 errors for Supabase functions, run:

   ```powershell
   node db/scripts/migration-runner.cjs db/migrations/fix_calendar_sync_functions.sql
   ```

3. Calendar webhooks setup:
   - If calendar events aren't syncing in real-time:
   ```powershell
   node tools/calendar/webhooks/register-calendar-webhook.cjs
   ```
