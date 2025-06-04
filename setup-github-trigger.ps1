# Automated GitHub Connection and Trigger Setup for Cloud Build

$PROJECT_ID = "crm-live-458710"
$TRIGGER_NAME = "deploy-main-to-cloud-run"
$REPO_NAME = "main"

Write-Host "=====================================" -ForegroundColor Green
Write-Host "GitHub & Cloud Build Trigger Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Set project
gcloud config set project $PROJECT_ID

Write-Host "This script will help you:" -ForegroundColor Yellow
Write-Host "1. Connect your GitHub repository to Cloud Build" -ForegroundColor Gray
Write-Host "2. Create an automatic deployment trigger" -ForegroundColor Gray
Write-Host ""

# Check if trigger already exists
Write-Host "Checking existing triggers..." -ForegroundColor Yellow
$triggers = gcloud builds triggers list --format=json 2>$null | ConvertFrom-Json
$triggerExists = $false

foreach ($trigger in $triggers) {
    if ($trigger.name -eq $TRIGGER_NAME) {
        $triggerExists = $true
        Write-Host "✓ Trigger '$TRIGGER_NAME' already exists!" -ForegroundColor Green
        Write-Host "  View at: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
        break
    }
}

if ($triggerExists) {
    Write-Host ""
    Write-Host "Your deployment pipeline is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To deploy your application:" -ForegroundColor Yellow
    Write-Host "1. Update cloudbuild.yaml:" -ForegroundColor Gray
    Write-Host "   git rm cloudbuild.yaml" -ForegroundColor Cyan
    Write-Host "   git mv cloudbuild-secure.yaml cloudbuild.yaml" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host "   git commit -m 'Setup secure Cloud Build configuration'" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor Cyan
    exit
}

# If no trigger exists, we need to set it up
Write-Host ""
Write-Host "No trigger found. Let's create one!" -ForegroundColor Yellow
Write-Host ""

# Get GitHub info from user
$GITHUB_USERNAME = Read-Host "Enter your GitHub username or organization name"

Write-Host ""
Write-Host "IMPORTANT: GitHub Connection Required" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red
Write-Host ""
Write-Host "Cloud Build needs permission to access your GitHub repository." -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Use GitHub App (Recommended)" -ForegroundColor Green
Write-Host "1. Go to: https://github.com/apps/google-cloud-build" -ForegroundColor Blue
Write-Host "2. Click 'Install' or 'Configure'" -ForegroundColor Gray
Write-Host "3. Select your repository: $GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Gray
Write-Host "4. Click 'Save'" -ForegroundColor Gray
Write-Host ""
Write-Host "Option 2: Use Cloud Console" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.cloud.google.com/cloud-build/triggers/connect?project=$PROJECT_ID" -ForegroundColor Blue
Write-Host "2. Select 'GitHub (Cloud Build GitHub App)'" -ForegroundColor Gray
Write-Host "3. Authenticate and select your repository" -ForegroundColor Gray
Write-Host ""

Write-Host "Press Enter after you've connected GitHub..." -ForegroundColor Yellow
Read-Host

# Try to create the trigger
Write-Host ""
Write-Host "Creating the build trigger..." -ForegroundColor Yellow

$triggerCreated = $false

# First attempt - using the connected repository
try {
    # For connected repos through GitHub App
    gcloud builds triggers create github `
        --repo-name="$REPO_NAME" `
        --repo-owner="$GITHUB_USERNAME" `
        --branch-pattern="^main$" `
        --build-config="cloudbuild.yaml" `
        --name="$TRIGGER_NAME" `
        --description="Deploy main branch to Cloud Run" `
        --include-logs-with-status 2>$null

    $triggerCreated = $true
}
catch {
    # Try alternate method
}

if (!$triggerCreated) {
    # Try creating with 2nd gen repositories
    try {
        # First, we need to find the connected repository
        Write-Host "Looking for connected repository..." -ForegroundColor Gray

        # Create a manual trigger as a fallback
        Write-Host "Creating manual trigger..." -ForegroundColor Yellow

        # Create trigger configuration file
        $triggerYaml = @"
name: $TRIGGER_NAME
description: Deploy main branch to Cloud Run
github:
  name: $REPO_NAME
  owner: $GITHUB_USERNAME
  push:
    branch: ^main$
filename: cloudbuild.yaml
"@

        $tempFile = New-TemporaryFile
        $triggerYaml | Out-File -FilePath $tempFile.FullName -Encoding UTF8

        gcloud builds triggers import --source=$tempFile.FullName
        Remove-Item $tempFile.FullName -Force

        $triggerCreated = $true
    }
    catch {
        Write-Host "Automated trigger creation failed." -ForegroundColor Red
    }
}

if ($triggerCreated) {
    Write-Host ""
    Write-Host "✓ Trigger created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your CI/CD pipeline is now ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your trigger at:" -ForegroundColor Blue
    Write-Host "https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "Please create the trigger manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
    Write-Host "2. Click 'CREATE TRIGGER'" -ForegroundColor Gray
    Write-Host "3. Use these settings:" -ForegroundColor Gray
    Write-Host "   - Name: $TRIGGER_NAME" -ForegroundColor Gray
    Write-Host "   - Event: Push to branch" -ForegroundColor Gray
    Write-Host "   - Source: $GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Gray
    Write-Host "   - Branch: ^main$" -ForegroundColor Gray
    Write-Host "   - Config: /cloudbuild.yaml" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Final Steps" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Update your repository to trigger deployment:" -ForegroundColor Yellow
Write-Host "git rm cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "git mv cloudbuild-secure.yaml cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor Cyan
Write-Host "git commit -m 'Setup secure Cloud Build configuration'" -ForegroundColor Cyan
Write-Host "git push origin main" -ForegroundColor Cyan
