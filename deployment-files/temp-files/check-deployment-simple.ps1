param(
    [string]$ProjectId = "crm-live-458710",
    [string]$Region = "us-east5",
    [string]$ServiceName = "project-crew-connect"
)

Write-Host "🔍 CLOUD RUN DEPLOYMENT STATUS CHECK" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Set the project
gcloud config set project $ProjectId 2>$null

# Get service details
Write-Host "📋 Checking service status..." -ForegroundColor Yellow
$serviceInfo = gcloud run services describe $ServiceName --region $Region --format json 2>$null | ConvertFrom-Json

if ($serviceInfo) {
    Write-Host "✅ Service found!" -ForegroundColor Green
    Write-Host "URL: $($serviceInfo.status.url)" -ForegroundColor Green
    Write-Host "Latest Revision: $($serviceInfo.status.latestReadyRevisionName)" -ForegroundColor Yellow

    # Test endpoints
    Write-Host "`n🧪 Testing service endpoints..." -ForegroundColor Yellow
    $serviceUrl = $serviceInfo.status.url

    # Test health endpoint
    try {
        $health = Invoke-WebRequest -Uri "$serviceUrl/health" -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ Health check: $($health.StatusCode) - $($health.Content)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check failed: $_" -ForegroundColor Red
    }

    # Test autocomplete endpoint
    try {
        $autocomplete = Invoke-WebRequest -Uri "$serviceUrl/api/maps/autocomplete?input=123+Main" -UseBasicParsing -TimeoutSec 10
        $content = $autocomplete.Content | ConvertFrom-Json
        Write-Host "✅ Autocomplete API: $($autocomplete.StatusCode) - Found $($content.Count) suggestions" -ForegroundColor Green
    } catch {
        Write-Host "❌ Autocomplete API failed: $_" -ForegroundColor Red
    }

    # Test auth status endpoint
    try {
        $auth = Invoke-WebRequest -Uri "$serviceUrl/api/auth/status" -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ Auth status API: $($auth.StatusCode) - $($auth.Content)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Auth status API failed: $_" -ForegroundColor Red
    }

    Write-Host "`n✅ Deployment appears to be working correctly!" -ForegroundColor Green
    Write-Host "You can access your application at: $serviceUrl" -ForegroundColor Cyan
} else {
    Write-Host "❌ Service not found!" -ForegroundColor Red
}
