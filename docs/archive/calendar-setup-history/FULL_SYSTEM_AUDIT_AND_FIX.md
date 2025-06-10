# Full System Audit: AKC CRM Calendar Integration

## Current Architecture Overview

### 1. Deployment Pipeline

- **Version Control**: GitHub (Cradcliff187/project-crew-connect)
- **Build System**: Google Cloud Build (triggered on git push)
- **Secret Management**: Google Secret Manager
- **Runtime**: Cloud Run (us-east5)
- **Project ID**: crm-live-458710

### 2. Authentication Systems

#### A. User OAuth Flow (Currently Working)

- **Purpose**: Individual user authentication
- **Endpoints**: `/auth/google` and `/auth/google/callback`
- **Session Storage**: Supabase (production) / In-memory (dev)
- **Used For**: Personal calendar access (if needed)

#### B. Service Account (Partially Implemented)

- **Purpose**: Access shared calendars without user login
- **Account**: `calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com`
- **File**: `credentials/calendar-service-account.json`
- **Module**: `server-service-account.cjs` (exists but not fully integrated)

### 3. Calendar Architecture

You have two shared Google Calendars:

- **Projects Calendar**: `c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com`
- **Work Orders Calendar**: `c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com`

## The Problem

### 1. Environment Variable Naming Mismatch

- **Backend expects**: `GOOGLE_CALENDAR_PROJECT` and `GOOGLE_CALENDAR_WORK_ORDER`
- **Frontend expects**: `VITE_GOOGLE_CALENDAR_PROJECTS` and `VITE_GOOGLE_CALENDAR_WORK_ORDER`
- **Current deployment**: Only has the backend versions

### 2. Why My Fix Broke

I added 4 new secrets to `cloudbuild.yaml` that don't exist in Google Secret Manager:

- `google-service-account-email` ❌
- `webhook-token` ❌
- `vite-google-calendar-projects` ❌
- `vite-google-calendar-work-order` ❌

### 3. Service Account Not Properly Configured

- The service account credentials exist but need to be base64 encoded for the app
- The code expects `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64` but deployment only has `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`

## The Correct Solution

### Option 1: Minimal Fix (Recommended)

Update the frontend code to use the existing environment variables:

```typescript
// In src/lib/calendarService.ts and src/services/enhancedCalendarService.ts
// Replace VITE_GOOGLE_CALENDAR_PROJECTS with VITE_GOOGLE_CALENDAR_PROJECT
// Replace VITE_GOOGLE_CALENDAR_WORK_ORDER with VITE_GOOGLE_CALENDAR_WORK_ORDER
```

Then in `vite.config.ts`, proxy the backend variables to frontend:

```typescript
define: {
  'import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT': JSON.stringify(process.env.GOOGLE_CALENDAR_PROJECT),
  'import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER': JSON.stringify(process.env.GOOGLE_CALENDAR_WORK_ORDER),
}
```

### Option 2: Update Google Secret Manager (More Work)

Create the missing secrets in Google Secret Manager:

```bash
# 1. Get the base64 encoded service account key
$json = Get-Content -Path ".\credentials\calendar-service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard

# 2. Create the secrets
gcloud secrets create google-service-account-email --data-file=- <<< "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com"
gcloud secrets create webhook-token --data-file=- <<< "xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0"
gcloud secrets create vite-google-calendar-projects --data-file=- <<< "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
gcloud secrets create vite-google-calendar-work-order --data-file=- <<< "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"

# 3. Update the existing secret with base64 version
gcloud secrets versions add google-service-account-credentials --data-file=- <<< "<PASTE-BASE64-FROM-CLIPBOARD>"
```

## What You Already Have Working

1. ✅ Google OAuth flow for users
2. ✅ All Supabase integration
3. ✅ Google Maps API proxy
4. ✅ Basic calendar API endpoints
5. ✅ Service account file exists
6. ✅ Calendar IDs configured

## What's Missing

1. ❌ Frontend can't access calendar IDs (environment variable mismatch)
2. ❌ Service account not being used for shared calendars
3. ❌ No two-way sync (webhook endpoint exists but not implemented)
4. ❌ Calendar permissions not set up for service account

## Immediate Action Items

1. **Fix the build** (already done by reverting cloudbuild.yaml)
2. **Choose Option 1 or 2** above
3. **Set calendar permissions** for the service account
4. **Test the integration** end-to-end

## Security Considerations

- Service account key should be base64 encoded in production
- Webhook token should be generated and stored securely
- Calendar IDs can be in frontend (they're not secret)
- All OAuth secrets must stay in Secret Manager
