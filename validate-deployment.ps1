# AKC Revisions V1 - Deployment Validation Script
# This script validates that the deployment pipeline is correctly configured

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Deployment Validation Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

$PROJECT_ID = (gcloud config get-value project)
if (!$PROJECT_ID) {
    Write-Host "Error: No GCP project configured. Run 'gcloud config set project PROJECT_ID'" -ForegroundColor Red
    exit 1
}

Write-Host "Using Project: $PROJECT_ID" -ForegroundColor Blue
Write-Host ""

# Check APIs
Write-Host "Checking enabled APIs..." -ForegroundColor Yellow
$requiredApis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com"
)

foreach ($api in $requiredApis) {
    $enabled = gcloud services list --enabled --filter="name:$api" --format="value(name)" 2>$null
    if ($enabled) {
        Write-Host "✓ $api is enabled" -ForegroundColor Green
    } else {
        Write-Host "✗ $api is NOT enabled" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking Artifact Registry..." -ForegroundColor Yellow
$null = gcloud artifacts repositories describe cloud-run-source-deploy --location=us-east5 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Artifact Registry repository exists" -ForegroundColor Green
} else {
    Write-Host "✗ Artifact Registry repository NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Service Account..." -ForegroundColor Yellow
$SERVICE_ACCOUNT_EMAIL = "project-crew-connect@${PROJECT_ID}.iam.gserviceaccount.com"
$null = gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Service account exists: $SERVICE_ACCOUNT_EMAIL" -ForegroundColor Green
} else {
    Write-Host "✗ Service account NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Secrets..." -ForegroundColor Yellow
$secrets = @(
    "supabase-url",
    "supabase-anon-key",
    "supabase-service-role-key",
    "google-client-id",
    "google-client-secret",
    "google-calendar-project",
    "google-calendar-work-order",
    "webhook-url",
    "google-maps-api-key"
)

foreach ($secret in $secrets) {
    $null = gcloud secrets describe $secret 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Secret exists: $secret" -ForegroundColor Green
    } else {
        Write-Host "✗ Secret NOT found: $secret" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking Cloud Build Triggers..." -ForegroundColor Yellow
$triggers = gcloud builds triggers list --filter="name:deploy-main-to-cloud-run" --format="value(name)" 2>$null
if ($triggers) {
    Write-Host "✓ Cloud Build trigger exists: deploy-main-to-cloud-run" -ForegroundColor Green
} else {
    Write-Host "✗ Cloud Build trigger NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Cloud Run Service..." -ForegroundColor Yellow
$null = gcloud run services describe project-crew-connect --region=us-east5 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Cloud Run service exists" -ForegroundColor Green

    # Get service URL
    $serviceUrl = gcloud run services describe project-crew-connect --region=us-east5 --format="value(status.url)" 2>$null
    if ($serviceUrl) {
        Write-Host "  Service URL: $serviceUrl" -ForegroundColor Blue
    }

    # Check authentication
    $iamPolicyJson = gcloud run services get-iam-policy project-crew-connect --region=us-east5 --format=json 2>$null
    if ($iamPolicyJson) {
        $iamPolicy = $iamPolicyJson | ConvertFrom-Json
        $hasAuthentication = $false
        foreach ($binding in $iamPolicy.bindings) {
            if ($binding.role -eq "roles/run.invoker") {
                foreach ($member in $binding.members) {
                    if ($member -like "*domain:*") {
                        $hasAuthentication = $true
                        Write-Host "  ✓ Domain authentication configured for: $member" -ForegroundColor Green
                    }
                }
            }
        }
        if (!$hasAuthentication) {
            Write-Host "  ⚠ Domain authentication NOT configured" -ForegroundColor Yellow
            Write-Host "  Note: Service is currently restricted (no public access)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "✗ Cloud Run service NOT found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Recent Builds..." -ForegroundColor Yellow
$recentBuilds = gcloud builds list --limit=3 --format="table(id,status,createTime.date())" 2>$null
if ($recentBuilds) {
    Write-Host "Recent builds:" -ForegroundColor Blue
    Write-Host $recentBuilds
} else {
    Write-Host "No recent builds found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Validation Complete" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
