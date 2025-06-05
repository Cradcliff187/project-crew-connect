# AKC Revisions V1 - Deployment Setup Continuation
# This script continues the setup after secrets are configured

$PROJECT_ID = "crm-live-458710"
$WORKSPACE_DOMAIN = Read-Host "Enter your Google Workspace domain (e.g., yourcompany.com)"

Write-Host "======================================" -ForegroundColor Green
Write-Host "Continuing Deployment Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Set the project
gcloud config set project $PROJECT_ID

Write-Host "Step 1: Enabling required APIs..." -ForegroundColor Green
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable iap.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

Write-Host ""
Write-Host "Step 2: Creating Artifact Registry repository..." -ForegroundColor Green
# Check if repository already exists
$null = gcloud artifacts repositories describe cloud-run-source-deploy --location=us-east5 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Artifact Registry repository already exists, skipping creation."
} else {
    gcloud artifacts repositories create cloud-run-source-deploy `
        --repository-format=docker `
        --location=us-east5 `
        --description="Container images for Cloud Run deployments"
}

Write-Host ""
Write-Host "Step 3: Creating service account for Cloud Run..." -ForegroundColor Green
$SERVICE_ACCOUNT_NAME = "project-crew-connect"
$SERVICE_ACCOUNT_EMAIL = "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if service account exists
$null = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Service account already exists, skipping creation."
} else {
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME `
        --display-name="Project Crew Connect Service Account"
}

# Grant necessary permissions to the service account
Write-Host "Granting permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" `
    --role="roles/secretmanager.secretAccessor"

Write-Host ""
Write-Host "Step 4: Granting Cloud Build permissions..." -ForegroundColor Green
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
$CLOUD_BUILD_SA = "${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

Write-Host "Granting permissions to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${CLOUD_BUILD_SA}" `
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${CLOUD_BUILD_SA}" `
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${CLOUD_BUILD_SA}" `
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${CLOUD_BUILD_SA}" `
    --role="roles/artifactregistry.writer"

Write-Host ""
Write-Host "Step 5: Initial Cloud Run deployment..." -ForegroundColor Green
Write-Host "Creating initial Cloud Run service..."
gcloud run deploy project-crew-connect `
    --image=gcr.io/cloudrun/hello `
    --region=us-east5 `
    --platform=managed `
    --no-allow-unauthenticated `
    --service-account=$SERVICE_ACCOUNT_EMAIL `
    --quiet

# Add IAM policy for domain users
Write-Host "Adding domain-wide access policy..."
gcloud run services add-iam-policy-binding project-crew-connect `
    --region=us-east5 `
    --member="domain:${WORKSPACE_DOMAIN}" `
    --role="roles/run.invoker"

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "IMPORTANT NEXT STEPS" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. CONNECT GITHUB REPOSITORY:" -ForegroundColor Yellow
Write-Host "   Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
Write-Host "   - Click 'Connect Repository'"
Write-Host "   - Select 'GitHub' as the source"
Write-Host "   - Authenticate and select your repository"
Write-Host "   - Click 'Connect'"
Write-Host ""
Write-Host "2. CREATE BUILD TRIGGER:" -ForegroundColor Yellow
Write-Host "   - Click 'Create Trigger'"
Write-Host "   - Name: deploy-main-to-cloud-run"
Write-Host "   - Event: Push to a branch"
Write-Host "   - Branch: ^main$"
Write-Host "   - Configuration: Cloud Build configuration file"
Write-Host "   - File location: /cloudbuild.yaml"
Write-Host "   - Click 'Create'"
Write-Host ""
Write-Host "3. UPDATE YOUR REPOSITORY:" -ForegroundColor Yellow
Write-Host "   Run these commands to use the secure Cloud Build configuration:"
Write-Host ""
Write-Host "   git rm cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "   git mv cloudbuild-secure.yaml cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host '   git commit -m "Setup secure Cloud Build configuration"' -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. MONITOR DEPLOYMENT:" -ForegroundColor Yellow
Write-Host "   Watch the build at: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
Write-Host ""
Write-Host "Setup complete! Your service will be accessible only to ${WORKSPACE_DOMAIN} users." -ForegroundColor Green
