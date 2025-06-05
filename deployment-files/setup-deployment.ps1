# AKC Revisions V1 - Deployment Setup Script (PowerShell)
# This script will guide you through setting up the complete CI/CD pipeline

Write-Host "======================================" -ForegroundColor Green
Write-Host "AKC Revisions V1 - Deployment Setup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Function to prompt for continuation
function Prompt-Continue {
    Write-Host "Press Enter to continue or Ctrl+C to abort..." -ForegroundColor Yellow
    Read-Host
}

# Function to prompt for input
function Prompt-Input {
    param($Prompt)
    Write-Host $Prompt -ForegroundColor Blue -NoNewline
    Write-Host " " -NoNewline
    return Read-Host
}

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Green
Write-Host ""

# Check if gcloud is installed
try {
    gcloud version | Out-Null
} catch {
    Write-Host "Error: gcloud CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Get project information
Write-Host "Please ensure you're logged into the correct Google Cloud account." -ForegroundColor Yellow
Write-Host "Running: gcloud auth login"
gcloud auth login

$PROJECT_ID = Prompt-Input "Enter your GCP Project ID:"
$WORKSPACE_DOMAIN = Prompt-Input "Enter your Google Workspace domain (e.g., yourcompany.com):"

# Set the project
gcloud config set project $PROJECT_ID

Write-Host ""
Write-Host "Step 2: Enabling required APIs..." -ForegroundColor Green
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable iap.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

Write-Host ""
Write-Host "Step 3: Creating Artifact Registry repository..." -ForegroundColor Green
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
Write-Host "Step 4: Creating service account for Cloud Run..." -ForegroundColor Green
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
Write-Host "Step 5: Setting up secrets in Secret Manager..." -ForegroundColor Green
Write-Host "You'll need to provide the following secrets:" -ForegroundColor Yellow
Write-Host "- Supabase URL and keys"
Write-Host "- Google OAuth credentials"
Write-Host "- Google Calendar IDs"
Write-Host "- Webhook URL"
Write-Host ""

# Function to create or update a secret
function Create-OrUpdateSecret {
    param($SecretName, $PromptText)

    Write-Host $PromptText -ForegroundColor Blue -NoNewline
    Write-Host " " -NoNewline
    $secretValue = Read-Host -AsSecureString
    $secretValuePlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretValue))

    # Check if secret exists
    $null = gcloud secrets describe $SecretName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Updating existing secret: $SecretName"
        $secretValuePlain | gcloud secrets versions add $SecretName --data-file=-
    } else {
        Write-Host "Creating new secret: $SecretName"
        $secretValuePlain | gcloud secrets create $SecretName --data-file=- --replication-policy="automatic"
    }
}

# Get secrets from user
Create-OrUpdateSecret "supabase-url" "Enter Supabase URL:"
Create-OrUpdateSecret "supabase-anon-key" "Enter Supabase Anon Key:"
Create-OrUpdateSecret "supabase-service-role-key" "Enter Supabase Service Role Key:"
Create-OrUpdateSecret "google-client-id" "Enter Google OAuth Client ID:"
Create-OrUpdateSecret "google-client-secret" "Enter Google OAuth Client Secret:"
Create-OrUpdateSecret "google-calendar-project" "Enter Google Calendar Project ID:"
Create-OrUpdateSecret "google-calendar-work-order" "Enter Google Calendar Work Order ID:"
Create-OrUpdateSecret "webhook-url" "Enter Webhook URL:"

Write-Host ""
Write-Host "Step 6: Granting Cloud Build permissions..." -ForegroundColor Green
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
Write-Host "Step 7: Setting up Cloud Build trigger..." -ForegroundColor Green
Write-Host "You need to connect your GitHub repository to Cloud Build." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please follow these steps:"
Write-Host "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
Write-Host "2. Click 'Connect Repository'"
Write-Host "3. Select 'GitHub' as the source"
Write-Host "4. Authenticate with GitHub and select your repository"
Write-Host "5. Click 'Connect'"
Write-Host ""
Prompt-Continue

Write-Host ""
Write-Host "Now, let's create the build trigger:" -ForegroundColor Yellow
Write-Host "1. In the same page, click 'Create Trigger'"
Write-Host "2. Use these settings:"
Write-Host "   - Name: deploy-main-to-cloud-run"
Write-Host "   - Description: Deploy main branch to Cloud Run"
Write-Host "   - Event: Push to a branch"
Write-Host "   - Source: Select your connected repository"
Write-Host "   - Branch: ^main$"
Write-Host "   - Configuration: Cloud Build configuration file"
Write-Host "   - File location: /cloudbuild-secure.yaml"
Write-Host "3. Click 'Create'"
Write-Host ""
Prompt-Continue

Write-Host ""
Write-Host "Step 8: Configuring authentication..." -ForegroundColor Green
Write-Host "Setting up Google Workspace domain restriction..." -ForegroundColor Yellow

# Initial deployment (if service doesn't exist)
Write-Host "Performing initial deployment to create the service..."
gcloud run deploy project-crew-connect `
    --image=gcr.io/cloudrun/hello `
    --region=us-east5 `
    --platform=managed `
    --no-allow-unauthenticated `
    --service-account=$SERVICE_ACCOUNT_EMAIL `
    --quiet 2>&1 | Out-Null

# Add IAM policy for domain users
Write-Host "Adding domain-wide access policy..."
gcloud run services add-iam-policy-binding project-crew-connect `
    --region=us-east5 `
    --member="domain:${WORKSPACE_DOMAIN}" `
    --role="roles/run.invoker"

Write-Host ""
Write-Host "Step 9: Final steps..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Update your cloudbuild.yaml" -ForegroundColor Yellow
Write-Host "1. Delete the existing cloudbuild.yaml"
Write-Host "2. Rename cloudbuild-secure.yaml to cloudbuild.yaml"
Write-Host "3. Commit and push to trigger the first deployment"
Write-Host ""
Write-Host "Run these commands:" -ForegroundColor Blue
Write-Host "git rm cloudbuild.yaml"
Write-Host "git mv cloudbuild-secure.yaml cloudbuild.yaml"
Write-Host "git add ."
Write-Host 'git commit -m "Setup secure Cloud Build configuration"'
Write-Host "git push origin main"
Write-Host ""

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Your Cloud Run service will be available at:"
Write-Host "https://project-crew-connect-[HASH]-ue.a.run.app"
Write-Host ""
Write-Host "The exact URL will be shown after the first successful deployment."
Write-Host "Only users from ${WORKSPACE_DOMAIN} will be able to access it."
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Push the cloudbuild.yaml changes to trigger deployment"
Write-Host "2. Monitor the build at: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
Write-Host "3. Once deployed, access your service and sign in with your Google Workspace account"
