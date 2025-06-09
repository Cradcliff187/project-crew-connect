param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "crm-live-458710",

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-west1",

    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "project-crew-connect"
)

Write-Host "🚀 CLOUD RUN DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host "Service: $ServiceName" -ForegroundColor White
Write-Host ""

# Check if gcloud is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    gcloud version | Out-Null
} catch {
    Write-Host "❌ gcloud CLI is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Set the project
Write-Host "`n🔧 Setting project..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Build and push the Docker image
$imageUrl = "$Region-docker.pkg.dev/$ProjectId/cloud-run-source-deploy/$ServiceName"
Write-Host "`n🏗️ Building and pushing Docker image..." -ForegroundColor Yellow
Write-Host "Image URL: $imageUrl" -ForegroundColor Gray

gcloud builds submit --tag $imageUrl
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build and push failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built and pushed successfully!" -ForegroundColor Green

# Deploy to Cloud Run with all environment variables and secrets
Write-Host "`n🚀 Deploying to Cloud Run..." -ForegroundColor Yellow

$deployCommand = @"
gcloud run deploy $ServiceName `
    --image $imageUrl `
    --region $Region `
    --platform managed `
    --allow-unauthenticated `
    --port 8080 `
    --cpu 1 `
    --memory 512Mi `
    --min-instances 0 `
    --max-instances 10 `
    --timeout 300 `
    --set-env-vars "NODE_ENV=production" `
    --set-secrets "SUPABASE_URL=SUPABASE_URL:latest" `
    --set-secrets "SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest" `
    --set-secrets "SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest" `
    --set-secrets "GOOGLE_OAUTH_CLIENT_ID=GOOGLE_OAUTH_CLIENT_ID:latest" `
    --set-secrets "GOOGLE_OAUTH_CLIENT_SECRET=GOOGLE_OAUTH_CLIENT_SECRET:latest" `
    --set-secrets "GOOGLE_MAPS_API_KEY=GOOGLE_MAPS_API_KEY:latest" `
    --set-secrets "GOOGLE_PROJECT_CALENDAR_ID=GOOGLE_PROJECT_CALENDAR_ID:latest" `
    --set-secrets "GOOGLE_WORK_ORDER_CALENDAR_ID=GOOGLE_WORK_ORDER_CALENDAR_ID:latest" `
    --set-secrets "WEBHOOK_URL=WEBHOOK_URL:latest"
"@

Write-Host "Executing deployment command..." -ForegroundColor Gray
Invoke-Expression $deployCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cloud Run deployment failed" -ForegroundColor Red
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check if all secrets exist in Secret Manager" -ForegroundColor White
    Write-Host "2. Verify service account permissions" -ForegroundColor White
    Write-Host "3. Check Cloud Run logs for details" -ForegroundColor White
    exit 1
}

Write-Host "`n✅ Deployment successful!" -ForegroundColor Green

# Get the service URL
Write-Host "`n🔍 Getting service information..." -ForegroundColor Yellow
$serviceInfo = gcloud run services describe $ServiceName --region $Region --format json | ConvertFrom-Json
$serviceUrl = $serviceInfo.status.url

Write-Host "`n📌 Service Details:" -ForegroundColor Cyan
Write-Host "URL: $serviceUrl" -ForegroundColor Green
Write-Host "Status: Ready" -ForegroundColor Green

# Test the deployment
Write-Host "`n🧪 Testing deployment..." -ForegroundColor Yellow
Write-Host "Testing health endpoint..." -ForegroundColor White
try {
    $healthUrl = "$serviceUrl/health"
    $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 30
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health check passed: $($response.StatusCode) - $($healthData.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Health check failed or timed out: $_" -ForegroundColor Yellow
    Write-Host "This might be normal if the service is still starting up." -ForegroundColor Gray
}

# Show logs command
Write-Host "`n📋 To view logs, run:" -ForegroundColor Yellow
Write-Host "gcloud run logs read --service $ServiceName --region $Region --limit 50" -ForegroundColor Gray

Write-Host "`n🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Your application is now live at: $serviceUrl" -ForegroundColor Cyan
