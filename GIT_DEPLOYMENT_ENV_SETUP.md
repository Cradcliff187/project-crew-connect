# Git-Based Deployment Environment Setup

Since you deploy via git push (not gcloud), environment variables must be configured in your deployment platform.

## Option 1: Google Cloud Run (via Cloud Build)

### Update cloudbuild.yaml

Add environment variables to your Cloud Run deployment step:

```yaml
# In cloudbuild.yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'project-crew-connect'
    - '--image'
    - 'gcr.io/$PROJECT_ID/project-crew-connect'
    - '--region'
    - 'us-east5'
    - '--platform'
    - 'managed'
    - '--set-env-vars'
    - |
      GOOGLE_SERVICE_ACCOUNT_EMAIL=calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com,
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=$$GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
      VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com,
      VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com,
      WEBHOOK_TOKEN=$$WEBHOOK_TOKEN
```

### Set Cloud Build Substitution Variables

```bash
# One-time setup in Google Cloud Console
gcloud builds submit --substitutions \
  _GOOGLE_SERVICE_ACCOUNT_KEY_BASE64='<your-base64-key>',\
  _WEBHOOK_TOKEN='xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0'
```

## Option 2: Using Google Secret Manager (Recommended)

### Step 1: Create Secrets

```bash
# Create secrets in Google Secret Manager
echo -n "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com" | gcloud secrets create google-service-account-email --data-file=-
echo -n "<your-base64-key>" | gcloud secrets create google-service-account-key-base64 --data-file=-
echo -n "xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0" | gcloud secrets create webhook-token --data-file=-
```

### Step 2: Update cloudbuild.yaml to use secrets

```yaml
# In cloudbuild.yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'project-crew-connect'
    - '--image'
    - 'gcr.io/$PROJECT_ID/project-crew-connect'
    - '--region'
    - 'us-east5'
    - '--platform'
    - 'managed'
    - '--update-secrets'
    - |
      GOOGLE_SERVICE_ACCOUNT_EMAIL=google-service-account-email:latest,
      GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=google-service-account-key-base64:latest,
      WEBHOOK_TOKEN=webhook-token:latest
    - '--set-env-vars'
    - |
      VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com,
      VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
```

## Option 3: GitHub Actions (if using)

### Add GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64`
   - `WEBHOOK_TOKEN`

### Update .github/workflows/deploy.yml

```yaml
env:
  GOOGLE_SERVICE_ACCOUNT_EMAIL: calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com
  GOOGLE_SERVICE_ACCOUNT_KEY_BASE64: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 }}
  VITE_GOOGLE_CALENDAR_PROJECTS: c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
  VITE_GOOGLE_CALENDAR_WORK_ORDER: c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
  WEBHOOK_TOKEN: ${{ secrets.WEBHOOK_TOKEN }}
```

## For Local Development

Keep using `.env` file:

```env
# Local .env (don't commit!)
GOOGLE_SERVICE_ACCOUNT_EMAIL=calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<your-base64-key>
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
WEBHOOK_TOKEN=xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0
```

## Important Notes

1. **Never commit secrets to git**
2. **Calendar IDs are safe to commit** (they're not sensitive)
3. **Service account email is safe to commit** (it's just an identifier)
4. **Keep secret**: Service account key (base64) and webhook token

## Verify Deployment

After deployment via git push:

```bash
# Check if env vars are set in Cloud Run
gcloud run services describe project-crew-connect --region us-east5 --format="value(spec.template.spec.containers[0].env[].name)"
```
