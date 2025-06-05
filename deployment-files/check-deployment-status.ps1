Write-Host "`n🔍 CHECKING DEPLOYMENT STATUS..." -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Get latest build
$latestBuild = gcloud builds list --limit=1 --format=value'(id,status)' | Out-String
$buildInfo = $latestBuild -split '\s+'
$buildId = $buildInfo[0]
$buildStatus = $buildInfo[1]

Write-Host "`n📦 Latest Build:" -ForegroundColor Yellow
Write-Host "ID: $buildId"
Write-Host "Status: " -NoNewline

switch ($buildStatus) {
    "SUCCESS" { Write-Host "✅ SUCCESS" -ForegroundColor Green }
    "FAILURE" { Write-Host "❌ FAILURE" -ForegroundColor Red }
    "WORKING" { Write-Host "🔄 IN PROGRESS..." -ForegroundColor Yellow }
    "QUEUED" { Write-Host "⏳ QUEUED" -ForegroundColor Gray }
    default { Write-Host $buildStatus }
}

# Check Cloud Run service
Write-Host "`n🚀 Cloud Run Service:" -ForegroundColor Yellow
$serviceUrl = gcloud run services describe project-crew-connect --region=us-east5 --format=value'(status.url)' 2>$null

if ($serviceUrl) {
    Write-Host "✅ Service is running at:" -ForegroundColor Green
    Write-Host $serviceUrl -ForegroundColor Cyan

    # Test the service
    Write-Host "`n🧪 Testing service..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $serviceUrl -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ Service is responding! (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Service might still be starting up..." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Service not found or not deployed yet" -ForegroundColor Red
}

Write-Host "`n💡 TIP: Run this script again in 2-3 minutes to check if deployment completed" -ForegroundColor Gray
Write-Host "View detailed logs at: https://console.cloud.google.com/cloud-build/builds?project=crm-live-458710" -ForegroundColor Gray
