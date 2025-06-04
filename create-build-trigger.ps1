# Script to create Cloud Build trigger for AKC Revisions V1

$PROJECT_ID = "crm-live-458710"
$TRIGGER_NAME = "deploy-main-to-cloud-run"
$REPO_NAME = "main"  # Your repository name
$REPO_OWNER = ""     # Will be filled by user

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Creating Cloud Build Trigger" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Set project
gcloud config set project $PROJECT_ID

# First, check if we have any connected repositories
Write-Host "Checking for connected GitHub repositories..." -ForegroundColor Yellow
$connectedRepos = gcloud beta builds repositories list --connection=github --region=us-central1 2>$null

if (!$connectedRepos) {
    Write-Host ""
    Write-Host "No GitHub repositories are connected yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You need to connect your GitHub repository first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.cloud.google.com/cloud-build/repositories/2nd-gen?project=$PROJECT_ID" -ForegroundColor Blue
    Write-Host "2. Click 'CONNECT REPOSITORY'" -ForegroundColor Blue
    Write-Host "3. Select 'GitHub' as the source" -ForegroundColor Blue
    Write-Host "4. Authenticate with GitHub" -ForegroundColor Blue
    Write-Host "5. Select your repository" -ForegroundColor Blue
    Write-Host "6. Click 'CONNECT'" -ForegroundColor Blue
    Write-Host ""
    Write-Host "After connecting, run this script again!" -ForegroundColor Yellow
    exit
}

# If we have repos, let's check if the trigger already exists
Write-Host "Checking if trigger already exists..." -ForegroundColor Yellow
$existingTrigger = gcloud builds triggers describe $TRIGGER_NAME 2>$null

if ($existingTrigger) {
    Write-Host "✓ Trigger '$TRIGGER_NAME' already exists!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To view the trigger:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
    exit
}

# Get GitHub account info
Write-Host ""
$REPO_OWNER = Read-Host "Enter your GitHub username or organization name"

Write-Host ""
Write-Host "Creating Cloud Build trigger..." -ForegroundColor Yellow

# Create the trigger using the classic method (1st gen)
$triggerConfig = @"
name: $TRIGGER_NAME
description: Deploy main branch to Cloud Run
github:
  owner: $REPO_OWNER
  name: $REPO_NAME
  push:
    branch: ^main$
filename: cloudbuild.yaml
"@

# Save trigger config to temp file
$tempFile = New-TemporaryFile
$triggerConfig | Out-File -FilePath $tempFile.FullName -Encoding UTF8

# Create the trigger
Write-Host "Creating trigger with configuration:" -ForegroundColor Gray
Write-Host $triggerConfig -ForegroundColor Gray
Write-Host ""

try {
    gcloud builds triggers create github `
        --repo-name=$REPO_NAME `
        --repo-owner=$REPO_OWNER `
        --branch-pattern="^main$" `
        --build-config=cloudbuild.yaml `
        --description="Deploy main branch to Cloud Run" `
        --name=$TRIGGER_NAME

    Write-Host ""
    Write-Host "✓ Trigger created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The trigger will automatically run when you push to the main branch." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "View your trigger at:" -ForegroundColor Blue
    Write-Host "https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
}
catch {
    Write-Host ""
    Write-Host "Failed to create trigger. This might be because:" -ForegroundColor Red
    Write-Host "- The repository isn't connected yet" -ForegroundColor Yellow
    Write-Host "- The repository name or owner is incorrect" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please connect your repository first at:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/cloud-build/repositories?project=$PROJECT_ID" -ForegroundColor Blue
}
finally {
    # Clean up temp file
    Remove-Item $tempFile.FullName -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Next Steps" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Update your repository to use the secure cloudbuild.yaml:" -ForegroundColor Yellow
Write-Host "   git rm cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "   git mv cloudbuild-secure.yaml cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Setup secure Cloud Build configuration'" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Monitor the build:" -ForegroundColor Yellow
Write-Host "   https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID" -ForegroundColor Blue
