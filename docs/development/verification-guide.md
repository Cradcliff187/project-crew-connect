# Verification Guide for Reorganized Structure

This guide provides steps to validate that the project's functionality is maintained after reorganization.

## 1. Verify Environment Setup

```powershell
# Test environment creation script
powershell -File tools/setup/create-env.ps1

# Verify .env file exists and contains required variables
if (Test-Path -Path '.env') {
    Write-Host ".env file exists" -ForegroundColor Green
    $envContents = Get-Content -Path '.env'

    # Check for key environment variables
    $requiredVars = @(
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REDIRECT_URI",
        "GOOGLE_CALENDAR_PROJECT",
        "GOOGLE_CALENDAR_WORK_ORDER"
    )

    foreach ($var in $requiredVars) {
        if ($envContents -match $var) {
            Write-Host "$var: Found" -ForegroundColor Green
        } else {
            Write-Host "$var: Missing" -ForegroundColor Red
        }
    }
} else {
    Write-Host ".env file does not exist" -ForegroundColor Red
}
```

## 2. Verify Supabase Connection

```powershell
# Test Supabase connection
node tests/supabase/test-connection.js

# Expected output:
# Testing Supabase connection...
# Successfully connected to Supabase!
# Retrieved 1 items
```

## 3. Verify Google Calendar Integration

```powershell
# Test Google Calendar integration
node tests/calendar/test-calendar-integration.js

# Expected output:
# 🔍 Starting Google Calendar integration test...
# 🔍 Validating environment variables...
# ✅ Environment validation complete
# 🔐 Initializing Google Calendar API with service account...
# 👤 Using service account: [email]
# 🗓️ Testing Project Calendar...
# ✅ Calendar integration test completed successfully!
```

## 4. Verify Webhook Registration

```powershell
# Test webhook registration
node tools/calendar/webhooks/register-calendar-webhook.cjs

# Expected output:
# Using webhook URL: [URL]
# Initializing Google Calendar API...
# 📧 Service Account Email: [email]
# ⚠️ This email must be given access to each calendar you want to use.
# Testing calendar access before registering webhooks...
# ✅ Successfully accessed calendar: [name]
# ✅ Registering webhook for project calendar
# Creating watch request for calendar: [calendar_id]
# ✅ Channel created: [id]
```

## 5. Verify Database Migrations

```powershell
# Try applying a test migration to validate the script works
node db/scripts/apply-migration.js db/migrations/add_calendar_integration.sql

# Expected output:
# Reading migration file: db/migrations/add_calendar_integration.sql
# Connecting to Supabase...
# Executing migration...
# Migration completed successfully.
```

## 6. Testing Full Application Functionality

### Backend Server

```powershell
# Start the backend server
node server/server.js

# Expected output:
# DEBUG: Loaded Env Vars:
#   GOOGLE_CLIENT_ID: Loaded
#   GOOGLE_CLIENT_SECRET: Loaded
#   GOOGLE_REDIRECT_URI: Loaded
#   GOOGLE_MAPS_API_KEY: Loaded
#   SUPABASE_URL: Loaded
#   SUPABASE_SERVICE_ROLE_KEY: Loaded
# Server started successfully on port 3000
```

### Frontend Server

```powershell
# In a new terminal window, start the frontend server
npm run dev

# Expected output:
# VITE v5.4.x ready in xxx ms
# ➜ Local: http://localhost:8080/
```

### Validation Steps

1. Open http://localhost:8080 in a browser
2. Verify the application loads correctly
3. Test the Google Calendar integration:
   - Navigate to Settings > Google Calendar
   - Connect your Google account
   - Create a test event
   - Verify it appears in the Google Calendar

## 7. Common Issues During Verification

### Path Reference Issues

If you encounter errors related to file paths:

1. Check for hardcoded paths in scripts
2. Update relative paths to reflect new directory structure
3. For dynamic paths, consider using path resolution:

```javascript
const path = require('path');
const filePath = path.resolve(__dirname, '../relative/path/to/file');
```

### Environment Variable Errors

If environment variables aren't loading:

1. Verify .env file exists
2. Check dotenv is being loaded at the beginning of scripts
3. Use absolute paths for credentials files
