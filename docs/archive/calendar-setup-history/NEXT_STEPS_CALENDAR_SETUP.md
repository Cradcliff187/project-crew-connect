# Next Steps for Calendar Setup

## What We've Done So Far

✅ **Created new service account key** for `project-crew-connect@crm-live-458710.iam.gserviceaccount.com`
✅ **Updated 5 code files** to support the scalable architecture:

- `server-service-account.cjs` - Now accepts multiple credential formats
- `src/lib/calendarService.ts` - Supports both env var names
- `src/services/enhancedCalendarService.ts` - Supports both env var names
- `vite.config.ts` - Passes backend vars to frontend
- `cloudbuild.yaml` - Ready for new secrets

✅ **Base64 key is in your clipboard** (3172 characters)

## What You Need to Do Now

### Step 1: Create Google Secrets (10 minutes)

Open a new Command Prompt or PowerShell and run these commands:

#### 1.1 Create webhook token

```bash
echo xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0 | gcloud secrets create webhook-token --data-file=-
```

#### 1.2 Update existing service account credentials to base64

**IMPORTANT**: Paste the base64 key from clipboard (Ctrl+V), press Enter, then Ctrl+Z, then Enter

```bash
gcloud secrets versions add google-service-account-credentials --data-file=-
```

#### 1.3 Create service account email (USING CORRECT EMAIL!)

```bash
echo project-crew-connect@crm-live-458710.iam.gserviceaccount.com | gcloud secrets create google-service-account-email --data-file=-
```

#### 1.4 Create projects calendar ID

```bash
echo c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com | gcloud secrets create vite-google-calendar-projects --data-file=-
```

#### 1.5 Create work orders calendar ID

```bash
echo c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com | gcloud secrets create vite-google-calendar-work-order --data-file=-
```

#### 1.6 Create base64 key secret

**IMPORTANT**: Paste the base64 key from clipboard again

```bash
gcloud secrets create google-service-account-key-base64 --data-file=-
```

#### 1.7 Create raw JSON for webhook

First, go back to PowerShell and run:

```powershell
Get-Content -Path ".\calendar-service-account-new.json" -Raw | Set-Clipboard
```

Then in Command Prompt, paste the raw JSON:

```bash
gcloud secrets create google-service-account-key --data-file=-
```

#### 1.8 Verify all secrets were created

```bash
gcloud secrets list --filter="name:(webhook-token OR google-service-account-email OR vite-google-calendar-projects OR vite-google-calendar-work-order OR google-service-account-key-base64 OR google-service-account-key)" --format="table(name)"
```

### Step 2: Commit and Deploy (5 minutes)

```bash
# Add all changed files
git add server-service-account.cjs src/lib/calendarService.ts src/services/enhancedCalendarService.ts vite.config.ts cloudbuild.yaml

# Commit with descriptive message
git commit -m "Implement scalable calendar integration with unified service account

- Use existing project-crew-connect service account for all operations
- Support multiple credential formats in service account module
- Fix frontend environment variable naming (PROJECTS vs PROJECT)
- Pass backend env vars to frontend via vite config
- Add new secrets to cloudbuild.yaml for calendar integration
- Maintain backward compatibility with existing deployments"

# Push to trigger deployment
git push origin main
```

### Step 3: Monitor Deployment (10-15 minutes)

Watch the build:

```bash
gcloud builds list --limit=1 --format="value(id)" | xargs gcloud builds log --stream
```

### Step 4: Update Local Files (After Deployment)

```powershell
# Backup old file
Copy-Item ".\credentials\calendar-service-account.json" ".\credentials\calendar-service-account-old.json"

# Use the new service account file
Copy-Item ".\calendar-service-account-new.json" ".\credentials\calendar-service-account.json" -Force
```

### Step 5: Grant Calendar Permissions

```powershell
# Set environment variables with CORRECT service account
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "project-crew-connect@crm-live-458710.iam.gserviceaccount.com"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials\calendar-service-account.json"
$env:VITE_GOOGLE_CALENDAR_PROJECTS = "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
$env:VITE_GOOGLE_CALENDAR_WORK_ORDER = "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"

# Run the permissions script
node setup-calendar-permissions.js
```

### Step 6: Test the Integration

1. Go to your app: https://project-crew-connect-1061142868787.us-east5.run.app
2. Create a new project or work order
3. Check if the event appears in the appropriate Google Calendar
4. Verify no authentication is required (service account handles it)

## Troubleshooting

### If secret creation fails:

```bash
# Check you're in the right project
gcloud config get-value project
# Should show: crm-live-458710
```

### If deployment fails:

- Check Cloud Build logs for specific error
- Verify all secrets exist: `gcloud secrets list`

### If calendar sync doesn't work:

```bash
# Check Cloud Run logs
gcloud run services logs project-crew-connect --region us-east5 --limit=50
```

## Success Indicators

✅ Build completes successfully
✅ No errors in Cloud Run logs about missing environment variables
✅ Calendar events sync without user authentication
✅ Service account has access to both calendars

## Architecture Benefits

You now have:

- **Single service account** for all operations
- **Scalable architecture** ready for growth
- **No user authentication required** for calendar sync
- **Backward compatible** with existing code
- **Ready for webhooks** and two-way sync

## Next Features You Can Add

1. **Two-way sync** via webhooks
2. **Calendar templates** for projects
3. **Bulk operations** for better performance
4. **Additional Google services** (Drive, Sheets, etc.)
