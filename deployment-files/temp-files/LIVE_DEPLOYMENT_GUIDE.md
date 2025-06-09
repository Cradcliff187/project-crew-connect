# Complete Guide: Getting Your AKC Revisions App Live on Cloud Run

This guide will walk you through getting your application fully deployed and operational on Google Cloud Run with all integrations working.

## Current Status

- **Project ID**: crm-live-458710
- **Service Name**: project-crew-connect
- **Region**: us-west1
- **Live URL**: https://project-crew-connect-dbztoro5pq-ul.a.run.app

## Step 1: Test Docker Build Locally

First, let's make sure the Docker container builds and runs correctly on your local machine:

```powershell
# Run the test script
.\test-build.ps1
```

This script will:

- Build the Docker image
- Run it locally
- Test the health endpoint
- Show you any errors

**If this fails**, the issue is with the Docker build or application code, not Cloud Run.

## Step 2: Check Current Deployment Status

Let's see what's happening with your current deployment:

```powershell
.\check-deployment-status.ps1
```

This will show you:

- Current service status
- Any error messages
- Recent logs
- Test the live endpoints

## Step 3: Deploy to Cloud Run

If the local test passes, deploy to Cloud Run:

```powershell
.\deploy-to-cloud-run.ps1
```

This script handles:

- Building and pushing the Docker image
- Deploying with all necessary environment variables
- Connecting to all your secrets in Secret Manager
- Testing the deployment

## Step 4: Verify All Integrations

After deployment, check each integration:

### A. Google Maps Autocomplete

Test URL: `https://project-crew-connect-dbztoro5pq-ul.a.run.app/api/maps/autocomplete?input=123%20Main`

Expected: JSON array of address suggestions

### B. Supabase Connection

- Open your app in the browser
- Check browser console for any Supabase errors
- Try logging in with Google OAuth

### C. Google Calendar

- Create a new project or work order
- Check if calendar events are created
- Look for any errors in Cloud Run logs

## Troubleshooting Common Issues

### Issue 1: Container Failed to Start

**Error**: "Container failed to start and listen on the port defined by the PORT=8080"

**Solutions**:

1. Run `.\test-build.ps1` to test locally
2. Check the Dockerfile has correct CMD
3. Ensure server-production.cjs exists and is correct
4. Check logs: `gcloud run logs read --service project-crew-connect --region us-west1 --limit 50`

### Issue 2: 403 Forbidden on OAuth

**Error**: Google OAuth returns 403 or redirects to wrong URL

**Solution**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
   - `https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/callback`
   - `https://oghnrsjzfycibheoewyn.supabase.co/auth/v1/callback`

### Issue 3: Missing Environment Variables

**Error**: Services fail with "Server configuration error"

**Solution**:
Check all secrets exist:

```powershell
gcloud secrets list
```

Create any missing secrets:

```powershell
echo "your-value-here" | gcloud secrets create SECRET_NAME --data-file=-
```

### Issue 4: API Routes Not Working

**Error**: /api/maps/\* routes return 404

**Solution**:

- Ensure server-production.cjs is handling API routes
- Check that express middleware is set up correctly
- Verify GOOGLE_MAPS_API_KEY secret is accessible

## Quick Commands Reference

### View Logs

```powershell
# Last 50 log entries
gcloud run logs read --service project-crew-connect --region us-west1 --limit 50

# Stream logs in real-time
gcloud run logs tail --service project-crew-connect --region us-west1
```

### Update Service

```powershell
# Update environment variable
gcloud run services update project-crew-connect --region us-west1 --update-env-vars KEY=VALUE

# Update memory/CPU
gcloud run services update project-crew-connect --region us-west1 --memory 1Gi --cpu 2
```

### Force New Deployment

```powershell
# If you need to force a fresh deployment
gcloud run deploy project-crew-connect --region us-west1 --image us-west1-docker.pkg.dev/crm-live-458710/cloud-run-source-deploy/project-crew-connect --force
```

## Next Steps

1. **Run the test script**: `.\test-build.ps1`
2. **Check deployment status**: `.\check-deployment-status.ps1`
3. **Deploy if needed**: `.\deploy-to-cloud-run.ps1`
4. **Monitor logs**: Watch for any errors after deployment
5. **Test all features**: Login, create projects, use calendar integration

## Getting Help

If you're still having issues after following this guide:

1. Run `.\check-deployment-status.ps1` and share the output
2. Check the logs for specific error messages
3. Test each integration individually
4. Verify all secrets are properly configured

Your application should be fully functional once all these steps are completed successfully!
