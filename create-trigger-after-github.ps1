# Automatic Cloud Build Trigger Creation
# Run this AFTER you click "Save" on the GitHub App page

$PROJECT_ID = "crm-live-458710"
$TRIGGER_NAME = "deploy-main-to-cloud-run"
$REPO_NAME = "project-crew-connect"
$REPO_OWNER = "Cradcliff187"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Automatic Cloud Build Trigger Creation" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Set project
gcloud config set project $PROJECT_ID

Write-Host "Waiting for GitHub connection to sync..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "Creating build trigger automatically..." -ForegroundColor Yellow

# Create the trigger
$triggerCreated = $false

# Method 1: Try with standard github trigger
Write-Host "Attempting method 1..." -ForegroundColor Gray
$result1 = gcloud builds triggers create github `
    --repo-name="$REPO_NAME" `
    --repo-owner="$REPO_OWNER" `
    --branch-pattern="^main$" `
    --build-config="cloudbuild.yaml" `
    --name="$TRIGGER_NAME" `
    --description="Deploy main branch to Cloud Run" 2>&1

if ($LASTEXITCODE -eq 0) {
    $triggerCreated = $true
}

# Method 2: Try with repository string format
if (!$triggerCreated) {
    Write-Host "Attempting method 2..." -ForegroundColor Gray
    $result2 = gcloud alpha builds triggers create github `
        --repo-name="$REPO_NAME" `
        --repo-owner="$REPO_OWNER" `
        --branch-pattern="^main$" `
        --build-config="cloudbuild.yaml" `
        --name="$TRIGGER_NAME" `
        --substitutions="_SERVICE_NAME=project-crew-connect,_REGION=us-east5" 2>&1

    if ($LASTEXITCODE -eq 0) {
        $triggerCreated = $true
    }
}

# Method 3: Import from YAML configuration
if (!$triggerCreated) {
    Write-Host "Attempting method 3 (import from config)..." -ForegroundColor Gray

    $triggerConfig = @"
name: $TRIGGER_NAME
description: Deploy main branch to Cloud Run
github:
  owner: $REPO_OWNER
  name: $REPO_NAME
  push:
    branch: ^main$
filename: cloudbuild.yaml
includedFiles:
  - "**"
"@

    $tempFile = New-TemporaryFile
    $triggerConfig | Out-File -FilePath $tempFile.FullName -Encoding UTF8

    $result3 = gcloud builds triggers import --source=$tempFile.FullName 2>&1

    if ($LASTEXITCODE -eq 0) {
        $triggerCreated = $true
    }

    Remove-Item $tempFile.FullName -Force -ErrorAction SilentlyContinue
}

if ($triggerCreated) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Trigger Created!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your CI/CD pipeline is now ready!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "View your trigger:" -ForegroundColor Cyan
    Write-Host "https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Deploy your application now:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "git rm cloudbuild.yaml" -ForegroundColor Cyan
    Write-Host "git mv cloudbuild-secure.yaml cloudbuild.yaml" -ForegroundColor Cyan
    Write-Host "git add ." -ForegroundColor Cyan
    Write-Host 'git commit -m "Setup secure Cloud Build configuration"' -ForegroundColor Cyan
    Write-Host "git push origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Monitor your build:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID" -ForegroundColor Blue
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Manual Trigger Creation Required" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "The automatic creation didn't work, but that's OK!" -ForegroundColor Yellow
    Write-Host "GitHub is now connected, so you can create it manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
    Write-Host "2. Click 'CREATE TRIGGER'" -ForegroundColor Cyan
    Write-Host "3. Fill in:" -ForegroundColor Cyan
    Write-Host "   - Name: $TRIGGER_NAME" -ForegroundColor Gray
    Write-Host "   - Description: Deploy main branch to Cloud Run" -ForegroundColor Gray
    Write-Host "   - Event: Push to a branch" -ForegroundColor Gray
    Write-Host "   - Repository: $REPO_OWNER/$REPO_NAME (2nd gen)" -ForegroundColor Gray
    Write-Host "   - Branch: ^main$" -ForegroundColor Gray
    Write-Host "   - Type: Cloud Build configuration file" -ForegroundColor Gray
    Write-Host "   - Location: /cloudbuild.yaml" -ForegroundColor Gray
    Write-Host "4. Click 'CREATE'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This will only take 2 minutes!" -ForegroundColor Green
}
