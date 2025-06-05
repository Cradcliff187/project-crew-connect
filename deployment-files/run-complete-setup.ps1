# Complete Deployment Setup Script for AKC Revisions V1
# This script runs the entire setup process

$PROJECT_ID = "crm-live-458710"
$WORKSPACE_DOMAIN = "akconstructionky.com"

Write-Host "======================================" -ForegroundColor Green
Write-Host "AKC Revisions V1 - Complete Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Project ID: $PROJECT_ID" -ForegroundColor Blue
Write-Host "Workspace Domain: $WORKSPACE_DOMAIN" -ForegroundColor Blue
Write-Host ""

# Set the project
Write-Host "Setting active project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Step 1: Enable APIs
Write-Host ""
Write-Host "Step 1: Enabling required APIs..." -ForegroundColor Green
$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iap.googleapis.com",
    "cloudresourcemanager.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Enabling $api..." -ForegroundColor Gray
    gcloud services enable $api --quiet
}

# Step 2: Create Artifact Registry
Write-Host ""
Write-Host "Step 2: Creating Artifact Registry repository..." -ForegroundColor Green
$null = gcloud artifacts repositories describe cloud-run-source-deploy --location=us-east5 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Repository already exists" -ForegroundColor Gray
} else {
    gcloud artifacts repositories create cloud-run-source-deploy `
        --repository-format=docker `
        --location=us-east5 `
        --description="Container images for Cloud Run deployments" `
        --quiet
    Write-Host "  Repository created" -ForegroundColor Gray
}

# Step 3: Create Service Account
Write-Host ""
Write-Host "Step 3: Creating service account..." -ForegroundColor Green
$SERVICE_ACCOUNT_NAME = "project-crew-connect"
$SERVICE_ACCOUNT_EMAIL = "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

$null = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Service account already exists" -ForegroundColor Gray
} else {
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME `
        --display-name="Project Crew Connect Service Account" `
        --quiet
    Write-Host "  Service account created" -ForegroundColor Gray
}

# Grant permissions to service account
Write-Host "  Granting permissions to service account..." -ForegroundColor Gray
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" `
    --role="roles/secretmanager.secretAccessor" `
    --quiet

# Step 4: Update all secrets
Write-Host ""
Write-Host "Step 4: Creating/updating Google Maps API key secret..." -ForegroundColor Green
$null = gcloud secrets describe google-maps-api-key 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Updating existing secret" -ForegroundColor Gray
    echo "AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I" | gcloud secrets versions add google-maps-api-key --data-file=-
} else {
    Write-Host "  Creating new secret" -ForegroundColor Gray
    echo "AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I" | gcloud secrets create google-maps-api-key --data-file=- --replication-policy="automatic"
}

# Step 5: Grant Cloud Build permissions
Write-Host ""
Write-Host "Step 5: Granting Cloud Build permissions..." -ForegroundColor Green
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
$CLOUD_BUILD_SA = "${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

$roles = @(
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.secretAccessor",
    "roles/artifactregistry.writer"
)

foreach ($role in $roles) {
    Write-Host "  Granting $role..." -ForegroundColor Gray
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:${CLOUD_BUILD_SA}" `
        --role="$role" `
        --quiet
}

# Step 6: Initial Cloud Run deployment
Write-Host ""
Write-Host "Step 6: Creating initial Cloud Run service..." -ForegroundColor Green
gcloud run deploy project-crew-connect `
    --image=gcr.io/cloudrun/hello `
    --region=us-east5 `
    --platform=managed `
    --no-allow-unauthenticated `
    --service-account=$SERVICE_ACCOUNT_EMAIL `
    --quiet

Write-Host "  Adding domain access policy..." -ForegroundColor Gray
gcloud run services add-iam-policy-binding project-crew-connect `
    --region=us-east5 `
    --member="domain:${WORKSPACE_DOMAIN}" `
    --role="roles/run.invoker" `
    --quiet

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service will be accessible only to ${WORKSPACE_DOMAIN} users" -ForegroundColor Blue
Write-Host ""
Write-Host "IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connect your GitHub repository:" -ForegroundColor Cyan
Write-Host "   https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
Write-Host ""
Write-Host "2. Create the build trigger with these settings:" -ForegroundColor Cyan
Write-Host "   - Name: deploy-main-to-cloud-run"
Write-Host "   - Branch: ^main$"
Write-Host "   - Build config: /cloudbuild.yaml"
Write-Host ""
Write-Host "3. Update your repository:" -ForegroundColor Cyan
Write-Host "   git rm cloudbuild.yaml"
Write-Host "   git mv cloudbuild-secure.yaml cloudbuild.yaml"
Write-Host "   git add ."
Write-Host '   git commit -m "Setup secure Cloud Build configuration"'
Write-Host "   git push origin main"
Write-Host ""
