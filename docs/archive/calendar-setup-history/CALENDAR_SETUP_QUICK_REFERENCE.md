# Calendar Setup Quick Reference

## Your Exact Values

### Service Account

- **Email**: `calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com`
- **File**: `credentials/calendar-service-account.json`

### Calendar IDs

- **Projects**: `c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com`
- **Work Orders**: `c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com`

### Security

- **Webhook Token**: `xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0`
- **Project ID**: `crm-live-458710`

## Copy-Paste Commands

### Step 1: Base64 Conversion (PowerShell)

```powershell
cd "C:\Dev\AKC Revisions-V1"
$json = Get-Content -Path ".\credentials\calendar-service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Host "✓ Base64 key copied to clipboard!"
```

### Step 2: Create All Secrets (Run in order)

```bash
# 1. Webhook token
echo xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0 | gcloud secrets create webhook-token --data-file=-

# 2. Update existing (PASTE base64 from clipboard when prompted)
gcloud secrets versions add google-service-account-credentials --data-file=-

# 3. Service account email
echo calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com | gcloud secrets create google-service-account-email --data-file=-

# 4. Projects calendar
echo c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com | gcloud secrets create vite-google-calendar-projects --data-file=-

# 5. Work orders calendar
echo c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com | gcloud secrets create vite-google-calendar-work-order --data-file=-

# 6. Base64 key (PASTE base64 from clipboard when prompted)
gcloud secrets create google-service-account-key-base64 --data-file=-

# 7. Raw JSON (PASTE raw JSON after running PowerShell command below)
gcloud secrets create google-service-account-key --data-file=-
```

### For Step 7: Copy Raw JSON (PowerShell)

```powershell
Get-Content -Path ".\credentials\calendar-service-account.json" -Raw | Set-Clipboard
Write-Host "✓ Raw JSON copied to clipboard!"
```

### Verify All Secrets

```bash
gcloud secrets list --filter="name:(webhook-token OR google-service-account-email OR vite-google-calendar-projects OR vite-google-calendar-work-order OR google-service-account-key-base64 OR google-service-account-key)" --format="table(name)"
```

### Final Git Commands

```bash
git add server-service-account.cjs src/lib/calendarService.ts src/services/enhancedCalendarService.ts vite.config.ts cloudbuild.yaml
git commit -m "Implement proper calendar integration with service account

- Add support for multiple credential formats in service account module
- Fix frontend environment variable naming (PROJECTS vs PROJECT)
- Pass backend env vars to frontend via vite config
- Add new secrets to cloudbuild.yaml for calendar integration
- Support both old and new env var names for smooth transition"
git push origin main
```

### Monitor Deployment

```bash
gcloud builds list --limit=1 --format="value(id)" | xargs gcloud builds log --stream
```

### Post-Deploy Calendar Permissions (PowerShell)

```powershell
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials\calendar-service-account.json"
$env:VITE_GOOGLE_CALENDAR_PROJECTS = "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
$env:VITE_GOOGLE_CALENDAR_WORK_ORDER = "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"
node setup-calendar-permissions.js
```

## Lines to Add to cloudbuild.yaml

Add these after line 70 (after `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`):

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
