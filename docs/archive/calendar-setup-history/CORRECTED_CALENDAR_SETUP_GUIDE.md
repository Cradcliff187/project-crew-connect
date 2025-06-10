# Corrected Calendar Setup Guide - Using Existing Service Account

## Important Discovery

The service account in your `calendar-service-account.json` file (`calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com`) **does not exist** in your project.

We'll use your existing `project-crew-connect@crm-live-458710.iam.gserviceaccount.com` service account instead, which already has the necessary permissions.

## Step 1: Create New Service Account Key

Run this command to create a new key for your existing service account:

```bash
gcloud iam service-accounts keys create calendar-service-account-new.json --iam-account=project-crew-connect@crm-live-458710.iam.gserviceaccount.com
```

This will create a new file `calendar-service-account-new.json` in your current directory.

## Step 2: Prepare the Service Account Key

Open PowerShell and run:

```powershell
# Navigate to your project
cd "C:\Dev\AKC Revisions-V1"

# Convert NEW service account to base64 and copy to clipboard
$json = Get-Content -Path ".\calendar-service-account-new.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Host "✓ Base64 key copied to clipboard!"
Write-Host "Length: $($base64.Length) characters"
```

Keep this PowerShell window open.

## Step 3: Create/Update Google Secrets

### 3.1: Create webhook token secret

```bash
echo xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0 | gcloud secrets create webhook-token --data-file=-
```

### 3.2: Update service account credentials to base64 version

**PASTE base64 from clipboard when prompted, then Ctrl+Z, Enter**

```bash
gcloud secrets versions add google-service-account-credentials --data-file=-
```

### 3.3: Create service account email secret (UPDATED EMAIL!)

```bash
echo project-crew-connect@crm-live-458710.iam.gserviceaccount.com | gcloud secrets create google-service-account-email --data-file=-
```

### 3.4: Create projects calendar secret

```bash
echo c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com | gcloud secrets create vite-google-calendar-projects --data-file=-
```

### 3.5: Create work orders calendar secret

```bash
echo c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com | gcloud secrets create vite-google-calendar-work-order --data-file=-
```

### 3.6: Create base64 key secret

**PASTE base64 from clipboard when prompted**

```bash
gcloud secrets create google-service-account-key-base64 --data-file=-
```

### 3.7: Create raw JSON key for Supabase webhook

Go back to PowerShell:

```powershell
# Copy raw JSON to clipboard
Get-Content -Path ".\calendar-service-account-new.json" -Raw | Set-Clipboard
Write-Host "✓ Raw JSON copied to clipboard!"
```

Then in command prompt:

```bash
gcloud secrets create google-service-account-key --data-file=-
```

## Step 4: Update Your Code Files

The code changes remain the same as before - just follow the original guide for:

- `server-service-account.cjs`
- `src/lib/calendarService.ts`
- `src/services/enhancedCalendarService.ts`
- `vite.config.ts`
- `cloudbuild.yaml`

## Step 5: Update Local Files

After deployment, update your local environment to use the new service account:

```powershell
# Backup old file
Copy-Item ".\credentials\calendar-service-account.json" ".\credentials\calendar-service-account-old.json"

# Replace with new file
Copy-Item ".\calendar-service-account-new.json" ".\credentials\calendar-service-account.json" -Force
```

## Step 6: Grant Calendar Permissions

After deployment, run this with the CORRECT service account email:

```powershell
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "project-crew-connect@crm-live-458710.iam.gserviceaccount.com"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials\calendar-service-account.json"
$env:VITE_GOOGLE_CALENDAR_PROJECTS = "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
$env:VITE_GOOGLE_CALENDAR_WORK_ORDER = "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"
node setup-calendar-permissions.js
```

## Key Differences from Original Guide

1. **Service Account Email**: Now using `project-crew-connect@crm-live-458710.iam.gserviceaccount.com`
2. **New Key File**: Creating a fresh key for the existing service account
3. **No New IAM Setup**: Using existing permissions

## Why This Is Better

- Uses an existing service account that already has proper IAM roles
- No need to create new service accounts or manage additional permissions
- The `project-crew-connect` service account is already used by Cloud Run, so it's trusted
- Cleaner architecture with fewer service accounts to manage
