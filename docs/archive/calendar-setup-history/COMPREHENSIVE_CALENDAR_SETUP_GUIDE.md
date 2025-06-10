# Comprehensive Calendar Integration Setup Guide

## Overview

This guide will walk you through properly setting up the calendar integration for your AKC CRM system. We'll be adding 5 new secrets to Google Secret Manager and updating your code to use them correctly.

## What We're Setting Up

1. **Service Account Authentication** - For accessing shared calendars without user login
2. **Webhook Security** - For two-way sync between Google Calendar and your app
3. **Calendar IDs** - Making them available to both frontend and backend
4. **Proper Environment Variables** - Fixing naming mismatches

## Files That Will Be Changed

1. `server-service-account.cjs` - Update to handle existing secret format
2. `src/lib/calendarService.ts` - Fix environment variable name
3. `src/services/enhancedCalendarService.ts` - Fix environment variable name
4. `vite.config.ts` - Pass backend variables to frontend
5. `cloudbuild.yaml` - Add new secrets (after creating them)
6. `supabase/functions/calendarWebhook/index.ts` - Already expects these variables

## Prerequisites

- Access to Google Cloud Console
- `gcloud` CLI installed and authenticated
- PowerShell (for Windows)
- Your existing files:
  - `credentials/calendar-service-account.json`
  - Calendar IDs (you already have these)

## Step 1: Prepare the Service Account Key

First, we need to convert your service account JSON to base64 format.

Open PowerShell and run:

```powershell
# Navigate to your project
cd "C:\Dev\AKC Revisions-V1"

# Convert service account to base64 and copy to clipboard
$json = Get-Content -Path ".\credentials\calendar-service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Host "✓ Base64 key copied to clipboard!"
Write-Host "Length: $($base64.Length) characters"
```

Keep this PowerShell window open - we'll need it again.

## Step 2: Create Google Secrets

Now we'll create 5 new secrets in Google Secret Manager. Run these commands one by one in a **new Command Prompt or PowerShell window**:

### 2.1: Create webhook token secret

```bash
echo xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0 | gcloud secrets create webhook-token --data-file=-
```

### 2.2: Update service account credentials to base64 version

**IMPORTANT**: When you run this command, it will wait for input. Paste the base64 key from your clipboard (Ctrl+V) and press Enter, then Ctrl+Z, then Enter again.

```bash
gcloud secrets versions add google-service-account-credentials --data-file=-
```

### 2.3: Create service account email secret

```bash
echo calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com | gcloud secrets create google-service-account-email --data-file=-
```

### 2.4: Create projects calendar secret

```bash
echo c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com | gcloud secrets create vite-google-calendar-projects --data-file=-
```

### 2.5: Create work orders calendar secret

```bash
echo c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com | gcloud secrets create vite-google-calendar-work-order --data-file=-
```

### 2.6: Create base64 key secret

**IMPORTANT**: Paste the base64 key again when prompted.

```bash
gcloud secrets create google-service-account-key-base64 --data-file=-
```

### 2.7: Create raw JSON key for Supabase webhook

Go back to your PowerShell window and run:

```powershell
# Copy raw JSON to clipboard
Get-Content -Path ".\credentials\calendar-service-account.json" -Raw | Set-Clipboard
Write-Host "✓ Raw JSON copied to clipboard!"
```

Then in the command prompt:

```bash
gcloud secrets create google-service-account-key --data-file=-
```

## Step 3: Verify Secrets Were Created

Run this command to verify all secrets exist:

```bash
gcloud secrets list --filter="name:(webhook-token OR google-service-account-email OR vite-google-calendar-projects OR vite-google-calendar-work-order OR google-service-account-key-base64 OR google-service-account-key)" --format="table(name)"
```

You should see all 6 secrets listed.

## Step 4: Update Your Code

Now let's update the code files:

### 4.1: Update server-service-account.cjs

Replace the `initialize()` method with this updated version that handles both base64 and raw JSON:

```javascript
async initialize() {
  if (this.initialized) {
    return true;
  }

  try {
    // Option 1: From base64 encoded env var (recommended for production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
      console.log('[Service Account] Initializing from base64 environment variable');
      const keyJson = Buffer.from(
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
        'base64'
      ).toString('utf-8');
      const key = JSON.parse(keyJson);

      this.auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ],
      });
    }
    // Option 1.5: From raw JSON env var (for backward compatibility)
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
      console.log('[Service Account] Initializing from JSON environment variable');
      const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

      this.auth = new google.auth.GoogleAuth({
        credentials: key,
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ],
      });
    }
    // Option 2: From file path (for local development)
    else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
      console.log('[Service Account] Initializing from file path');
      this.auth = new google.auth.GoogleAuth({
        keyFilename: path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE),
        scopes: [
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/calendar.events',
        ],
      });
    } else {
      console.warn('[Service Account] No service account credentials configured');
      return false;
    }

    // Test the credentials
    const client = await this.auth.getClient();
    await client.getAccessToken();

    this.initialized = true;
    console.log('[Service Account] ✓ Service account initialized successfully');
    return true;
  } catch (error) {
    console.error('[Service Account] ✗ Failed to initialize:', error.message);
    return false;
  }
}
```

### 4.2: Update src/lib/calendarService.ts

Change line 20 from:

```typescript
const sharedProjectCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS;
```

To:

```typescript
const sharedProjectCalendarId =
  import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS || import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT;
```

### 4.3: Update src/services/enhancedCalendarService.ts

Change lines 77-80 from:

```typescript
targetCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS || 'primary';

if (!import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS) {
  console.warn('⚠️ VITE_GOOGLE_CALENDAR_PROJECTS not configured, using primary calendar');
```

To:

```typescript
targetCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS || import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT || 'primary';

if (!import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS && !import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT) {
  console.warn('⚠️ VITE_GOOGLE_CALENDAR_PROJECTS/PROJECT not configured, using primary calendar');
```

### 4.4: Update vite.config.ts

Add a `define` section after the `resolve` section:

```typescript
export default defineConfig(({ mode }) => ({
  // ... existing config ...
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    // Pass backend env vars to frontend during build
    'import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT': JSON.stringify(
      process.env.GOOGLE_CALENDAR_PROJECT
    ),
    'import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER': JSON.stringify(
      process.env.GOOGLE_CALENDAR_WORK_ORDER
    ),
  },
}));
```

### 4.5: Update cloudbuild.yaml

Add these lines to the Cloud Run deploy step (after line 70):

```yaml
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_EMAIL=google-service-account-email:latest'
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=google-service-account-key-base64:latest'
- '--update-secrets'
- 'WEBHOOK_TOKEN=webhook-token:latest'
- '--update-secrets'
- 'VITE_GOOGLE_CALENDAR_PROJECTS=vite-google-calendar-projects:latest'
- '--update-secrets'
- 'VITE_GOOGLE_CALENDAR_WORK_ORDER=vite-google-calendar-work-order:latest'
```

### 4.6: Update Supabase Functions (for webhook)

The webhook already expects `GOOGLE_SERVICE_ACCOUNT_KEY`, so we need to add it to Supabase:

```bash
# First, let's set up Supabase CLI if not already done
supabase secrets set WEBHOOK_TOKEN=xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0
```

Then paste the raw JSON when prompted:

```bash
supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY
```

## Step 5: Commit and Deploy

```bash
# Add all changed files
git add server-service-account.cjs src/lib/calendarService.ts src/services/enhancedCalendarService.ts vite.config.ts cloudbuild.yaml

# Commit with descriptive message
git commit -m "Implement proper calendar integration with service account

- Add support for multiple credential formats in service account module
- Fix frontend environment variable naming (PROJECTS vs PROJECT)
- Pass backend env vars to frontend via vite config
- Add new secrets to cloudbuild.yaml for calendar integration
- Support both old and new env var names for smooth transition"

# Push to trigger deployment
git push origin main
```

## Step 6: Monitor Deployment

Watch the Cloud Build logs:

```bash
gcloud builds list --limit=1 --format="value(id)" | xargs gcloud builds log --stream
```

## Step 7: Grant Calendar Permissions (After Deployment)

Once deployed, run this locally to grant the service account access to your calendars:

```powershell
# Set up environment
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials\calendar-service-account.json"
$env:VITE_GOOGLE_CALENDAR_PROJECTS = "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
$env:VITE_GOOGLE_CALENDAR_WORK_ORDER = "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"

# Run the setup script
node setup-calendar-permissions.js
```

## Step 8: Verify Everything Works

1. Check deployment status:

```bash
gcloud run services describe project-crew-connect --region us-east5 --format="get(status.url)"
```

2. Test calendar integration:
   - Go to your app
   - Create a new project or work order
   - Check if events appear in Google Calendar
   - Try creating an event in Google Calendar and see if it syncs back

## Troubleshooting

### If secrets creation fails:

- Make sure you're authenticated: `gcloud auth login`
- Check your project: `gcloud config get-value project`
- Should show: `crm-live-458710`

### If deployment fails:

- Check Cloud Build logs for specific errors
- Verify all secrets were created: `gcloud secrets list`

### If calendar sync doesn't work:

- Check Cloud Run logs: `gcloud run services logs project-crew-connect --region us-east5 --limit=50`
- Verify service account has calendar access (Step 7)

## Summary of Changes

1. **Created 6 new secrets** in Google Secret Manager
2. **Updated 5 code files** to handle the new configuration
3. **Maintained backward compatibility** with existing setup
4. **Enabled service account** for shared calendar access
5. **Fixed environment variable** naming mismatches

The system will now:

- Use service account for shared calendars (no user login needed)
- Have proper webhook security with token validation
- Pass calendar IDs correctly to both frontend and backend
- Support two-way sync when webhooks are configured
