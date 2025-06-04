#!/bin/bash

# AKC Revisions V1 - Deployment Setup Script
# This script will guide you through setting up the complete CI/CD pipeline

set -e

echo "======================================"
echo "AKC Revisions V1 - Deployment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for continuation
prompt_continue() {
    echo -e "${YELLOW}Press Enter to continue or Ctrl+C to abort...${NC}"
    read
}

# Function to prompt for input
prompt_input() {
    local prompt=$1
    local var_name=$2
    echo -e "${BLUE}${prompt}${NC}"
    read -r $var_name
}

# Step 1: Check prerequisites
echo -e "${GREEN}Step 1: Checking prerequisites...${NC}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed.${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get project information
echo -e "${YELLOW}Please ensure you're logged into the correct Google Cloud account.${NC}"
echo "Running: gcloud auth login"
gcloud auth login

prompt_input "Enter your GCP Project ID:" PROJECT_ID
prompt_input "Enter your Google Workspace domain (e.g., yourcompany.com):" WORKSPACE_DOMAIN

# Set the project
gcloud config set project $PROJECT_ID

echo ""
echo -e "${GREEN}Step 2: Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable iap.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

echo ""
echo -e "${GREEN}Step 3: Creating Artifact Registry repository...${NC}"
# Check if repository already exists
if gcloud artifacts repositories describe cloud-run-source-deploy --location=us-east5 &> /dev/null; then
    echo "Artifact Registry repository already exists, skipping creation."
else
    gcloud artifacts repositories create cloud-run-source-deploy \
        --repository-format=docker \
        --location=us-east5 \
        --description="Container images for Cloud Run deployments"
fi

echo ""
echo -e "${GREEN}Step 4: Creating service account for Cloud Run...${NC}"
SERVICE_ACCOUNT_NAME="project-crew-connect"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Check if service account exists
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
    echo "Service account already exists, skipping creation."
else
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="Project Crew Connect Service Account"
fi

# Grant necessary permissions to the service account
echo "Granting permissions to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"

echo ""
echo -e "${GREEN}Step 5: Setting up secrets in Secret Manager...${NC}"
echo -e "${YELLOW}You'll need to provide the following secrets:${NC}"
echo "- Supabase URL and keys"
echo "- Google OAuth credentials"
echo "- Google Calendar IDs"
echo "- Webhook URL"
echo ""

# Function to create or update a secret
create_or_update_secret() {
    local secret_name=$1
    local prompt_text=$2

    echo -e "${BLUE}${prompt_text}${NC}"
    read -r -s secret_value
    echo ""

    # Check if secret exists
    if gcloud secrets describe $secret_name &> /dev/null; then
        echo "Updating existing secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets versions add $secret_name --data-file=-
    else
        echo "Creating new secret: $secret_name"
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=- --replication-policy="automatic"
    fi
}

# Get secrets from user
create_or_update_secret "supabase-url" "Enter Supabase URL:"
create_or_update_secret "supabase-anon-key" "Enter Supabase Anon Key:"
create_or_update_secret "supabase-service-role-key" "Enter Supabase Service Role Key:"
create_or_update_secret "google-client-id" "Enter Google OAuth Client ID:"
create_or_update_secret "google-client-secret" "Enter Google OAuth Client Secret:"
create_or_update_secret "google-calendar-project" "Enter Google Calendar Project ID:"
create_or_update_secret "google-calendar-work-order" "Enter Google Calendar Work Order ID:"
create_or_update_secret "webhook-url" "Enter Webhook URL:"

echo ""
echo -e "${GREEN}Step 6: Granting Cloud Build permissions...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "Granting permissions to Cloud Build service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/artifactregistry.writer"

echo ""
echo -e "${GREEN}Step 7: Setting up Cloud Build trigger...${NC}"
echo -e "${YELLOW}You need to connect your GitHub repository to Cloud Build.${NC}"
echo ""
echo "Please follow these steps:"
echo "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
echo "2. Click 'Connect Repository'"
echo "3. Select 'GitHub' as the source"
echo "4. Authenticate with GitHub and select your repository"
echo "5. Click 'Connect'"
echo ""
prompt_continue

echo ""
echo -e "${YELLOW}Now, let's create the build trigger:${NC}"
echo "1. In the same page, click 'Create Trigger'"
echo "2. Use these settings:"
echo "   - Name: deploy-main-to-cloud-run"
echo "   - Description: Deploy main branch to Cloud Run"
echo "   - Event: Push to a branch"
echo "   - Source: Select your connected repository"
echo "   - Branch: ^main$"
echo "   - Configuration: Cloud Build configuration file"
echo "   - File location: /cloudbuild-secure.yaml"
echo "3. Click 'Create'"
echo ""
prompt_continue

echo ""
echo -e "${GREEN}Step 8: Configuring authentication...${NC}"
echo -e "${YELLOW}Setting up Google Workspace domain restriction...${NC}"

# Initial deployment (if service doesn't exist)
echo "Performing initial deployment to create the service..."
gcloud run deploy project-crew-connect \
    --image=gcr.io/cloudrun/hello \
    --region=us-east5 \
    --platform=managed \
    --no-allow-unauthenticated \
    --service-account=$SERVICE_ACCOUNT_EMAIL \
    --quiet || true

# Add IAM policy for domain users
echo "Adding domain-wide access policy..."
gcloud run services add-iam-policy-binding project-crew-connect \
    --region=us-east5 \
    --member="domain:${WORKSPACE_DOMAIN}" \
    --role="roles/run.invoker"

echo ""
echo -e "${GREEN}Step 9: Final steps...${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Update your cloudbuild.yaml${NC}"
echo "1. Delete the existing cloudbuild.yaml"
echo "2. Rename cloudbuild-secure.yaml to cloudbuild.yaml"
echo "3. Commit and push to trigger the first deployment"
echo ""
echo "Run these commands:"
echo -e "${BLUE}git rm cloudbuild.yaml${NC}"
echo -e "${BLUE}git mv cloudbuild-secure.yaml cloudbuild.yaml${NC}"
echo -e "${BLUE}git add .${NC}"
echo -e "${BLUE}git commit -m 'Setup secure Cloud Build configuration'${NC}"
echo -e "${BLUE}git push origin main${NC}"
echo ""

echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Your Cloud Run service will be available at:"
echo "https://project-crew-connect-[HASH]-ue.a.run.app"
echo ""
echo "The exact URL will be shown after the first successful deployment."
echo "Only users from ${WORKSPACE_DOMAIN} will be able to access it."
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Push the cloudbuild.yaml changes to trigger deployment"
echo "2. Monitor the build at: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
echo "3. Once deployed, access your service and sign in with your Google Workspace account"
