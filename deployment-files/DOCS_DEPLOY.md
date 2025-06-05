# Deployment Documentation - AKC Revisions V1

## Overview

This document describes the complete deployment pipeline for the AKC Revisions V1 application, deploying from GitHub to Google Cloud Run with continuous deployment.

## Architecture

- **Source Control**: GitHub (main branch)
- **Build System**: Google Cloud Build
- **Container Registry**: Google Artifact Registry
- **Runtime**: Google Cloud Run
- **Database**: Supabase (hosted PostgreSQL)
- **Authentication**: Google Workspace domain restriction

## Prerequisites

1. Google Cloud Project with billing enabled
2. GitHub repository connected to Google Cloud Build
3. Supabase project with credentials
4. Google Workspace domain for authentication

## Quick Setup

### Automated Setup Scripts

We provide automated setup scripts to configure the entire deployment pipeline:

#### For Windows (PowerShell):

```powershell
# Run the setup script
.\setup-deployment.ps1

# After setup, validate the configuration
.\validate-deployment.ps1
```

#### For Linux/macOS (Bash):

```bash
# Make the script executable
chmod +x setup-deployment.sh

# Run the setup script
./setup-deployment.sh
```

The setup script will:

1. Check prerequisites (gcloud CLI)
2. Configure your GCP project
3. Enable required APIs
4. Create Artifact Registry repository
5. Set up service accounts
6. Configure secrets in Secret Manager
7. Set up Cloud Build permissions
8. Guide you through GitHub connection
9. Configure domain-based authentication

## Manual Setup Steps

### 1. Enable Required GCP APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable iap.googleapis.com
```

### 2. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=us-east5 \
  --description="Container images for Cloud Run deployments"
```

### 3. Store Secrets in Secret Manager

```bash
# Store Supabase credentials
echo -n "YOUR_SUPABASE_URL" | gcloud secrets create supabase-url --data-file=-
echo -n "YOUR_SUPABASE_ANON_KEY" | gcloud secrets create supabase-anon-key --data-file=-
echo -n "YOUR_SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets create supabase-service-role-key --data-file=-

# Store Google OAuth credentials
echo -n "YOUR_GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id --data-file=-
echo -n "YOUR_GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret --data-file=-

# Store Google Calendar IDs
echo -n "YOUR_GOOGLE_CALENDAR_PROJECT_ID" | gcloud secrets create google-calendar-project --data-file=-
echo -n "YOUR_GOOGLE_CALENDAR_WORK_ORDER_ID" | gcloud secrets create google-calendar-work-order --data-file=-

# Store webhook URL
echo -n "YOUR_WEBHOOK_URL" | gcloud secrets create webhook-url --data-file=-
```

### 4. Grant Cloud Build Permissions

```bash
# Get the Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/secretmanager.secretAccessor"
```

### 5. Configure Cloud Build Trigger

1. Go to Cloud Console > Cloud Build > Triggers
2. Click "Create Trigger"
3. Configure:
   - Name: `deploy-main-to-cloud-run`
   - Description: `Deploy main branch to Cloud Run`
   - Event: Push to branch
   - Source: Your GitHub repository
   - Branch: `^main$`
   - Build configuration: Cloud Build configuration file
   - Location: `/cloudbuild.yaml`

### 6. Set up Google Workspace Authentication

```bash
# Create OAuth consent screen if not exists
# Go to: Console > APIs & Services > OAuth consent screen
# Configure for internal use only (your domain)

# Configure Cloud Run service with IAP
gcloud run services update project-crew-connect \
  --region=us-east5 \
  --ingress=all \
  --no-allow-unauthenticated

# Add IAM policy for domain users
gcloud run services add-iam-policy-binding project-crew-connect \
  --region=us-east5 \
  --member="domain:your-domain.com" \
  --role="roles/run.invoker"
```

## Environment Variables

The following environment variables are configured via Secret Manager:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_PROJECT`
- `GOOGLE_CALENDAR_WORK_ORDER`
- `WEBHOOK_URL`

## Deployment Process

1. Developer pushes code to `main` branch
2. Cloud Build trigger activates
3. Cloud Build:
   - Builds Docker image using Dockerfile
   - Pushes image to Artifact Registry
   - Deploys to Cloud Run with secrets from Secret Manager
4. Cloud Run service updates with new revision
5. Traffic automatically routes to new revision

## Monitoring & Troubleshooting

### View Build Logs

```bash
gcloud builds list --limit=5
gcloud builds log [BUILD_ID]
```

### View Cloud Run Logs

```bash
gcloud run services logs read project-crew-connect --region=us-east5
```

### Check Service Status

```bash
gcloud run services describe project-crew-connect --region=us-east5
```

## Manual Deployment (if needed)

```bash
# Build and push manually
docker build -t us-east5-docker.pkg.dev/[PROJECT_ID]/cloud-run-source-deploy/project-crew-connect:latest .
docker push us-east5-docker.pkg.dev/[PROJECT_ID]/cloud-run-source-deploy/project-crew-connect:latest

# Deploy to Cloud Run
gcloud run deploy project-crew-connect \
  --image=us-east5-docker.pkg.dev/[PROJECT_ID]/cloud-run-source-deploy/project-crew-connect:latest \
  --region=us-east5 \
  --platform=managed
```

## Security Considerations

1. All secrets stored in Secret Manager, never in code
2. Cloud Run service requires authentication
3. Access restricted to Google Workspace domain users
4. Service account has minimum required permissions
5. HTTPS enforced by default on Cloud Run

## Rollback Process

```bash
# List revisions
gcloud run revisions list --service=project-crew-connect --region=us-east5

# Route traffic to previous revision
gcloud run services update-traffic project-crew-connect \
  --region=us-east5 \
  --to-revisions=[PREVIOUS_REVISION_NAME]=100
```

## Deployment Files Created

### 1. `cloudbuild-secure.yaml`

A secure Cloud Build configuration that:

- Uses Secret Manager for all sensitive data
- Tags images with commit SHA for traceability
- Requires authentication (no public access)
- Configures proper resource limits

### 2. `Dockerfile`

Updated to correctly:

- Build the React frontend
- Serve static files from the dist directory
- Run on port 8080 (Cloud Run default)

### 3. `setup-deployment.ps1` / `setup-deployment.sh`

Interactive setup scripts that guide you through the entire configuration process.

### 4. `validate-deployment.ps1`

A validation script that checks:

- API enablement status
- Artifact Registry configuration
- Service account setup
- Secret Manager secrets
- Cloud Build triggers
- Cloud Run service status
- Authentication configuration

## Important Security Notes

1. **Never commit secrets** - All sensitive data is stored in Secret Manager
2. **Authentication required** - The service requires Google Workspace authentication
3. **Domain restriction** - Only users from your specified domain can access the service
4. **Service accounts** - Using dedicated service accounts with minimum required permissions
5. **HTTPS only** - Cloud Run enforces HTTPS by default

## Troubleshooting

### Build Fails

1. Check build logs: `gcloud builds log [BUILD_ID]`
2. Verify all secrets are correctly set in Secret Manager
3. Ensure Cloud Build has necessary permissions

### Authentication Issues

1. Verify domain is correctly set in IAM policy
2. Check OAuth consent screen is configured for internal use
3. Ensure user is part of the Google Workspace domain

### Service Not Accessible

1. Check service status: `gcloud run services describe project-crew-connect --region=us-east5`
2. Verify IAM bindings are correct
3. Check if service is deployed: `gcloud run services list --region=us-east5`

## Next Steps After Setup

1. **Replace cloudbuild.yaml**: Delete the old file and rename `cloudbuild-secure.yaml` to `cloudbuild.yaml`
2. **Commit and push**: This will trigger your first automated deployment
3. **Monitor the build**: Watch progress in the Cloud Console
4. **Access your service**: Use the URL provided after deployment, authenticate with your Google Workspace account
5. **Set up monitoring**: Configure Cloud Monitoring alerts for your service

## Support

For issues or questions:

1. Check the validation script output
2. Review Cloud Build logs
3. Check Cloud Run logs for runtime issues
4. Verify all secrets are properly configured
