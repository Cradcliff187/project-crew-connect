# Diagnose Cloud Run Issues Without Terminal

## Step 1: Check Service Status in Cloud Console

1. Go to: https://console.cloud.google.com/run?project=crm-live-458710
2. Click on "project-crew-connect" service
3. Look for the status - it will show one of:
   - ✅ Green checkmark (Running)
   - ❌ Red X (Failed)
   - ⏳ Yellow/Orange (Deploying)

## Step 2: Check the Logs in Cloud Console

1. While viewing your service, click on the "LOGS" tab
2. Look for these specific errors:
   - "Container failed to start"
   - "PORT environment variable"
   - "Error" or "Fatal"

## Step 3: Check the Latest Revision

1. Click on the "REVISIONS" tab
2. Look at the latest revision status
3. If it shows "Failed", click on it
4. Check the "Details" section for error messages

## Common Issues and Quick Fixes:

### Issue: "Container failed to start and listen on port 8080"

**This is likely your issue!**

Quick fix - Deploy using Cloud Console:

1. Click "EDIT & DEPLOY NEW REVISION"
2. In Container tab:
   - Container port: 8080
   - Memory: 512 MiB
   - CPU: 1
3. In Variables & Secrets tab, add:
   - Environment variable: PORT = 8080
4. Click "DEPLOY"

### Issue: Missing Secrets

1. Go to https://console.cloud.google.com/security/secret-manager?project=crm-live-458710
2. Check if all these secrets exist:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - GOOGLE_OAUTH_CLIENT_ID
   - GOOGLE_OAUTH_CLIENT_SECRET
   - GOOGLE_MAPS_API_KEY
   - GOOGLE_PROJECT_CALENDAR_ID
   - GOOGLE_WORK_ORDER_CALENDAR_ID
   - WEBHOOK_URL

## Step 4: Test Container Locally (Without gcloud)

Run this in PowerShell:

```powershell
# Build the container
docker build -t test-app .

# Run it with test environment
docker run -p 8080:8080 -e PORT=8080 test-app
```

Then open: http://localhost:8080/health

If this works locally but not on Cloud Run, the issue is with Cloud Run configuration.

## Step 5: Manual Re-deployment via Console

If nothing else works, do a fresh deployment:

1. Go to Cloud Run console
2. Click "CREATE SERVICE"
3. Select "Deploy one revision from an existing container image"
4. Use this image: `us-west1-docker.pkg.dev/crm-live-458710/cloud-run-source-deploy/project-crew-connect`
5. Service name: `project-crew-connect-v2` (new name to avoid conflicts)
6. Region: us-west1
7. CPU allocation: "CPU is allocated only during request processing"
8. Autoscaling: Min 0, Max 10
9. Authentication: Allow unauthenticated invocations
10. Container port: 8080
11. Memory: 512 MiB
12. Add all the secrets from the Variables & Secrets tab
13. Click CREATE

## What to Report Back:

Please tell me:

1. What status shows in Cloud Run console?
2. What error appears in the LOGS tab?
3. Does the container run locally with Docker?
4. Are all secrets present in Secret Manager?

This will help me provide the exact fix you need.
