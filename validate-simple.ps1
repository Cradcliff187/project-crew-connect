# Simple Validation Script for AKC Revisions V1

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Deployment Validation" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$PROJECT_ID = "crm-live-458710"
Write-Host "Project: $PROJECT_ID" -ForegroundColor Blue
Write-Host ""

# Check Service
Write-Host "Checking Cloud Run Service..." -ForegroundColor Yellow
$serviceInfo = gcloud run services describe project-crew-connect --region=us-east5 --format=json 2>$null | ConvertFrom-Json
if ($serviceInfo) {
    Write-Host "✓ Service exists" -ForegroundColor Green
    Write-Host "  URL: $($serviceInfo.status.url)" -ForegroundColor Blue
    Write-Host "  Ready: $($serviceInfo.status.conditions[0].status)" -ForegroundColor Blue
} else {
    Write-Host "✗ Service NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Secrets..." -ForegroundColor Yellow
$secrets = @(
    "supabase-url",
    "supabase-anon-key",
    "google-client-id",
    "google-maps-api-key",
    "webhook-url"
)

$allSecretsExist = $true
foreach ($secret in $secrets) {
    $null = gcloud secrets describe $secret 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $secret" -ForegroundColor Green
    } else {
        Write-Host "✗ $secret" -ForegroundColor Red
        $allSecretsExist = $false
    }
}

Write-Host ""
Write-Host "Checking Build Trigger..." -ForegroundColor Yellow
$triggers = gcloud builds triggers list --format=json 2>$null | ConvertFrom-Json
$foundTrigger = $false
foreach ($trigger in $triggers) {
    if ($trigger.name -eq "deploy-main-to-cloud-run") {
        $foundTrigger = $true
        Write-Host "✓ Build trigger exists" -ForegroundColor Green
    }
}
if (!$foundTrigger) {
    Write-Host "✗ Build trigger NOT found - You need to create it!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Summary" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

if ($serviceInfo) {
    Write-Host "✓ Cloud Run service is deployed" -ForegroundColor Green
    Write-Host "  Access it at: $($serviceInfo.status.url)" -ForegroundColor Blue
} else {
    Write-Host "✗ Cloud Run service needs deployment" -ForegroundColor Red
}

if ($allSecretsExist) {
    Write-Host "✓ All secrets are configured" -ForegroundColor Green
} else {
    Write-Host "✗ Some secrets are missing" -ForegroundColor Red
}

if (!$foundTrigger) {
    Write-Host ""
    Write-Host "NEXT STEP: Create the build trigger" -ForegroundColor Yellow
    Write-Host "Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID" -ForegroundColor Blue
}
