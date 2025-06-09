# Complete Calendar Integration Deployment Guide

## Overview

This guide walks you through deploying a production-ready calendar integration with:

- Service account for reliable calendar operations
- Two-way sync via webhooks
- Shared calendars for projects and work orders

## Prerequisites

- Google Cloud Project with Calendar API enabled
- Supabase project
- Node.js environment for running setup scripts

## Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "IAM & Admin" > "Service Accounts"
4. Click "Create Service Account"
   - Name: `akc-calendar-service`
   - Description: "Service account for AKC CRM calendar operations"
5. Click "Create and Continue"
6. Grant roles:
   - Click "Select a role"
   - Search for "Service Account Token Creator"
   - Add another role: "Calendar API" (or create custom role with calendar permissions)
7. Click "Continue" then "Done"
8. Find your new service account in the list
9. Click on it, then go to "Keys" tab
10. Add Key > Create new key > JSON
11. Save the downloaded JSON file securely

## Step 2: Prepare Service Account Key

Convert the JSON key to base64 for environment variable:

```bash
# On Windows PowerShell:
$json = Get-Content -Path "path\to\your-service-account-key.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Output "Base64 key copied to clipboard!"

# On Mac/Linux:
base64 -i path/to/your-service-account-key.json | pbcopy
echo "Base64 key copied to clipboard!"
```

## Step 3: Set Environment Variables

Add to your `.env` file:

```env
# Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=akc-calendar-service@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<paste-base64-key-here>

# For local development (optional):
# GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./credentials/service-account-key.json

# Shared Calendar IDs (get these after creating calendars)
VITE_GOOGLE_CALENDAR_PROJECTS=<projects-calendar-id>
VITE_GOOGLE_CALENDAR_WORK_ORDER=<work-orders-calendar-id>

# Webhook Configuration
WEBHOOK_URL=https://your-project.supabase.co/functions/v1/calendarWebhook
WEBHOOK_TOKEN=<generate-secure-random-token>
```

Generate a secure webhook token:

```bash
# PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Mac/Linux:
openssl rand -hex 32
```

## Step 4: Create Shared Calendars

1. Go to [Google Calendar](https://calendar.google.com)
2. Create "AKC Projects" calendar:
   - Click "+" next to "Other calendars"
   - Select "Create new calendar"
   - Name: "AKC Projects"
   - Description: "Shared calendar for all project events"
   - Click "Create calendar"
3. Create "AKC Work Orders" calendar:
   - Repeat with name "AKC Work Orders"
4. Get Calendar IDs:
   - Click the 3 dots next to each calendar
   - Select "Settings and sharing"
   - Scroll to "Integrate calendar"
   - Copy the "Calendar ID"
   - Update your `.env` file

## Step 5: Deploy Backend Changes

```bash
# Commit and push the backend changes
git add server-service-account.cjs server-google-calendar-auth.cjs
git commit -m "Add service account support for calendar integration"
git push origin main
```

## Step 6: Grant Service Account Permissions

Run the setup script to grant your service account access to the shared calendars:

```bash
node setup-calendar-permissions.js
```

Follow the prompts:

1. Visit the provided URL
2. Log in with a Google account that has admin access to the calendars
3. Copy the callback URL and paste it back
4. The script will grant permissions automatically

## Step 7: Deploy Webhook Function

Deploy the calendar webhook to Supabase:

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set webhook secrets
supabase secrets set WEBHOOK_TOKEN=your-webhook-token
supabase secrets set GOOGLE_SERVICE_ACCOUNT_KEY='<json-key-not-base64>'

# Deploy the function
supabase functions deploy calendarWebhook
```

## Step 8: Register Webhooks

Create and run the webhook registration script:

```javascript
// register-webhooks.js
const { google } = require('googleapis');
const serviceAccountAuth = require('./server-service-account.cjs');

async function registerWebhooks() {
  await serviceAccountAuth.initialize();
  const auth = await serviceAccountAuth.getClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const calendars = [
    { id: process.env.VITE_GOOGLE_CALENDAR_PROJECTS, name: 'Projects' },
    { id: process.env.VITE_GOOGLE_CALENDAR_WORK_ORDER, name: 'Work Orders' },
  ];

  for (const cal of calendars) {
    try {
      const response = await calendar.events.watch({
        calendarId: cal.id,
        requestBody: {
          id: require('crypto').randomUUID(),
          type: 'web_hook',
          address: process.env.WEBHOOK_URL,
          token: process.env.WEBHOOK_TOKEN,
        },
      });
      console.log(`✓ Webhook registered for ${cal.name} calendar`);
      console.log(`  Expiration: ${new Date(parseInt(response.data.expiration))}`);
    } catch (error) {
      console.error(`✗ Failed to register webhook for ${cal.name}:`, error.message);
    }
  }
}

registerWebhooks();
```

Run it:

```bash
node register-webhooks.js
```

## Step 9: Test the Integration

### Test 1: Service Account Creation

1. Log out of the app
2. Create a schedule item via API
3. Verify event appears in Google Calendar

### Test 2: Two-Way Sync

1. Create an event directly in Google Calendar
2. Wait a few seconds
3. Check if it appears in your app's schedule items

### Test 3: Update Sync

1. Edit an event in Google Calendar
2. Verify changes sync to the app

### Test 4: Delete Sync

1. Delete an event in Google Calendar
2. Verify it's removed from the app

## Step 10: Production Deployment

Update production environment variables:

```bash
# Google Cloud Run
gcloud run services update project-crew-connect \
  --update-env-vars "GOOGLE_SERVICE_ACCOUNT_EMAIL=..." \
  --update-env-vars "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=..." \
  --update-env-vars "VITE_GOOGLE_CALENDAR_PROJECTS=..." \
  --update-env-vars "VITE_GOOGLE_CALENDAR_WORK_ORDER=..."
```

## Maintenance

### Weekly Tasks

- Check webhook expiration (7-day limit)
- Re-run `register-webhooks.js` before expiration

### Monthly Tasks

- Review calendar permissions
- Check API quotas
- Audit failed sync operations

## Troubleshooting

### "Authentication required" errors

- Ensure service account is initialized
- Check environment variables are set
- Verify service account has calendar access

### Events not syncing from Google

- Check webhook registration status
- Verify webhook URL is accessible
- Check Supabase function logs

### Service account can't access calendars

- Re-run `setup-calendar-permissions.js`
- Verify calendar IDs in environment
- Check service account email is correct

## Security Best Practices

1. **Never commit service account keys**

   - Use base64 encoding for environment variables
   - Add `*.json` to `.gitignore`

2. **Rotate webhook tokens regularly**

   - Generate new token monthly
   - Update both webhook registration and Supabase

3. **Monitor access logs**

   - Review Google Cloud audit logs
   - Check for unauthorized calendar access

4. **Limit service account scope**
   - Only grant necessary calendar permissions
   - Use separate service accounts for different environments
