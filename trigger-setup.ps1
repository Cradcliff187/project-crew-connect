# GitHub Build Trigger Setup Script

$PROJECT_ID = "crm-live-458710"
$TRIGGER_NAME = "deploy-main-to-cloud-run"
$REPO_NAME = "main"

Write-Host ""
Write-Host "GitHub Build Trigger Setup" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green
Write-Host ""

# Set project
gcloud config set project $PROJECT_ID

# Check if trigger exists
Write-Host "Checking for existing trigger..." -ForegroundColor Yellow
$existingTriggers = gcloud builds triggers list --format="value(name)" 2>$null

$triggerFound = $false
if ($existingTriggers) {
    foreach ($trigger in $existingTriggers) {
        if ($trigger -eq $TRIGGER_NAME) {
            $triggerFound = $true
            break
        }
    }
}

if ($triggerFound) {
    Write-Host "[OK] Trigger already exists!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your pipeline is ready. Just push your code!" -ForegroundColor Yellow
    exit
}

Write-Host "No trigger found. Creating one..." -ForegroundColor Yellow
Write-Host ""

# Get GitHub username
$GITHUB_USERNAME = Read-Host "Enter your GitHub username or organization"

Write-Host ""
Write-Host "Attempting to create build trigger..." -ForegroundColor Yellow

# Create the trigger command
gcloud builds triggers create github `
    --repo-name="$REPO_NAME" `
    --repo-owner="$GITHUB_USERNAME" `
    --branch-pattern="^main$" `
    --build-config="cloudbuild.yaml" `
    --name="$TRIGGER_NAME" `
    --description="Deploy main branch to Cloud Run"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Trigger created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View at: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
}
else {
    Write-Host ""
    Write-Host "[ERROR] Could not create trigger automatically." -ForegroundColor Red
    Write-Host ""
    Write-Host "GitHub needs to be connected first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 1: Install Cloud Build GitHub App" -ForegroundColor Green
    Write-Host "https://github.com/apps/google-cloud-build" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Step 2: Create trigger manually" -ForegroundColor Green
    Write-Host "https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Trigger settings:" -ForegroundColor Yellow
    Write-Host "  Name: $TRIGGER_NAME" -ForegroundColor Gray
    Write-Host "  Event: Push to branch" -ForegroundColor Gray
    Write-Host "  Source: $GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Gray
    Write-Host "  Branch: ^main$" -ForegroundColor Gray
    Write-Host "  Config: /cloudbuild.yaml" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "===========" -ForegroundColor Green
Write-Host ""
Write-Host "After trigger is created, deploy with:" -ForegroundColor Yellow
Write-Host ""
Write-Host "git rm cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "git mv cloudbuild-secure.yaml cloudbuild.yaml" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor Cyan
Write-Host 'git commit -m "Setup secure Cloud Build configuration"' -ForegroundColor Cyan
Write-Host "git push origin main" -ForegroundColor Cyan
