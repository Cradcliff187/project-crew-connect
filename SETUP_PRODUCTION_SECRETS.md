# Production Secrets Setup for Git Deployment

Since you deploy via git and your `cloudbuild.yaml` uses Google Secret Manager, here's exactly what you need to do:

## Step 1: Generate Base64 Service Account Key

Run this PowerShell command first:

```powershell
$json = Get-Content -Path ".\credentials\calendar-service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Host "Base64 key copied to clipboard!"
```

## Step 2: Create/Update Google Secrets

Run these commands (paste the base64 key when prompted):

```bash
# 1. Create webhook token secret (new)
echo -n "xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0" | gcloud secrets create webhook-token --data-file=-

# 2. Update the service account credentials secret with base64 version
# (Your cloudbuild.yaml already references this)
gcloud secrets delete google-service-account-credentials --quiet
echo -n "<PASTE-BASE64-KEY-FROM-CLIPBOARD>" | gcloud secrets create google-service-account-credentials --data-file=-

# 3. Create service account email secret (new)
echo -n "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com" | gcloud secrets create google-service-account-email --data-file=-

# 4. Create VITE calendar secrets (new)
echo -n "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com" | gcloud secrets create vite-google-calendar-projects --data-file=-
echo -n "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com" | gcloud secrets create vite-google-calendar-work-order --data-file=-
```

## Step 3: Update cloudbuild.yaml

Add these lines to your cloudbuild.yaml in the Cloud Run deploy step:

```yaml
# Find this section in your cloudbuild.yaml:
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_CREDENTIALS=google-service-account-credentials:latest'

# Add these new lines after it:
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_EMAIL=google-service-account-email:latest'
- '--update-secrets'
- 'GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=google-service-account-credentials:latest'
- '--update-secrets'
- 'WEBHOOK_TOKEN=webhook-token:latest'
- '--update-secrets'
- 'VITE_GOOGLE_CALENDAR_PROJECTS=vite-google-calendar-projects:latest'
- '--update-secrets'
- 'VITE_GOOGLE_CALENDAR_WORK_ORDER=vite-google-calendar-work-order:latest'
```

## Step 4: Commit and Deploy

```bash
git add cloudbuild.yaml
git commit -m "Add calendar integration secrets to Cloud Run deployment"
git push origin main
```

## Verify After Deployment

Once Cloud Build completes:

```bash
# Check if all env vars are set
gcloud run services describe project-crew-connect \
  --region us-east5 \
  --format="value(spec.template.spec.containers[0].env[].name)"

# Should include:
# GOOGLE_SERVICE_ACCOUNT_EMAIL
# GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
# WEBHOOK_TOKEN
# VITE_GOOGLE_CALENDAR_PROJECTS
# VITE_GOOGLE_CALENDAR_WORK_ORDER
```

## Important Notes

1. Your existing `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS` secret needs to be the **base64** version
2. The calendar IDs are already in your `env-template.txt` - we're just making them available as VITE\_ variables
3. The webhook token is a new random string for security
4. All sensitive data stays in Google Secret Manager - never in git

## Local Development

For local testing, create a `.env` file:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<paste-base64-key>
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
WEBHOOK_TOKEN=xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0
```
