param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "crm-live-458710",

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-west1",

    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "project-crew-connect"
)

Write-Host "🔍 CLOUD RUN DEPLOYMENT STATUS CHECK" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host "Service: $ServiceName" -ForegroundColor White
Write-Host ""

# Set the project
gcloud config set project $ProjectId 2>$null

# Check if service exists
Write-Host "📋 Checking service status..." -ForegroundColor Yellow
$serviceCheck = gcloud run services describe $ServiceName --region $Region --format json 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Service '$ServiceName' not found in region '$Region'" -ForegroundColor Red
    Write-Host "`nAvailable services:" -ForegroundColor Yellow
    gcloud run services list --region $Region --format "table(SERVICE,REGION,URL,LAST_DEPLOYED_BY,LAST_DEPLOYED_AT)"
    exit 1
}

$serviceInfo = $serviceCheck | ConvertFrom-Json

# Display service information
Write-Host "`n✅ Service found!" -ForegroundColor Green
Write-Host "`n📌 Service Details:" -ForegroundColor Cyan
Write-Host "Name: $($serviceInfo.metadata.name)" -ForegroundColor White
Write-Host "URL: $($serviceInfo.status.url)" -ForegroundColor Green
Write-Host "Created: $($serviceInfo.metadata.creationTimestamp)" -ForegroundColor White
Write-Host "Generation: $($serviceInfo.metadata.generation)" -ForegroundColor White

# Check latest revision
$latestRevision = $serviceInfo.status.latestReadyRevisionName
Write-Host "`n🔄 Latest Revision: $latestRevision" -ForegroundColor Yellow

# Check conditions
Write-Host "`n📊 Service Conditions:" -ForegroundColor Yellow
foreach ($condition in $serviceInfo.status.conditions) {
    $status = if ($condition.status -eq "True") { "✅" } else { "❌" }
    $color = if ($condition.status -eq "True") { "Green" } else { "Red" }
    Write-Host "$status $($condition.type): $($condition.status)" -ForegroundColor $color
    if ($condition.message) {
        Write-Host "   Message: $($condition.message)" -ForegroundColor Gray
    }
}

# Check traffic allocation
Write-Host "`n🚦 Traffic Allocation:" -ForegroundColor Yellow
foreach ($traffic in $serviceInfo.status.traffic) {
    Write-Host "Revision: $($traffic.revisionName) - $($traffic.percent)%" -ForegroundColor White
}

# Get recent logs
Write-Host "`n📜 Recent Logs (last 20 entries):" -ForegroundColor Yellow
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$ServiceName AND resource.labels.location=$Region" --limit=20 --format="table(timestamp,severity,textPayload)"

# Check for common issues
Write-Host "`n🔧 Checking for common issues..." -ForegroundColor Yellow

# Check if service is ready
if ($serviceInfo.status.conditions | Where-Object { $_.type -eq "Ready" -and $_.status -eq "True" }) {
    Write-Host "✅ Service is ready and serving traffic" -ForegroundColor Green
} else {
    Write-Host "❌ Service is not ready" -ForegroundColor Red

    # Check for specific error conditions
    $readyCondition = $serviceInfo.status.conditions | Where-Object { $_.type -eq "Ready" }
    if ($readyCondition.message -match "container failed to start") {
        Write-Host "`n⚠️ Container startup issue detected!" -ForegroundColor Yellow
        Write-Host "Possible causes:" -ForegroundColor White
        Write-Host "- Application is not listening on the correct port (should be 8080)" -ForegroundColor White
        Write-Host "- Missing environment variables or secrets" -ForegroundColor White
        Write-Host "- Application crashes during startup" -ForegroundColor White
        Write-Host "- Dockerfile issues" -ForegroundColor White
    }
}

# Test the service
Write-Host "`n🧪 Testing service endpoints..." -ForegroundColor Yellow
$serviceUrl = $serviceInfo.status.url

# Test health endpoint
try {
    Write-Host "Testing /health endpoint..." -ForegroundColor White
    $healthResponse = Invoke-WebRequest -Uri "$serviceUrl/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Health check: $($healthResponse.StatusCode) - $($healthResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

# Test main page
try {
    Write-Host "Testing main page..." -ForegroundColor White
    $mainResponse = Invoke-WebRequest -Uri $serviceUrl -UseBasicParsing -TimeoutSec 10 -Method Head
    Write-Host "✅ Main page: $($mainResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Main page failed: $_" -ForegroundColor Red
}

# Provide troubleshooting commands
Write-Host "`n📚 Useful troubleshooting commands:" -ForegroundColor Yellow
Write-Host "View more logs:" -ForegroundColor White
Write-Host "  gcloud run logs read --service $ServiceName --region $Region --limit 100" -ForegroundColor Gray
Write-Host "`nDescribe service in detail:" -ForegroundColor White
Write-Host "  gcloud run services describe $ServiceName --region $Region" -ForegroundColor Gray
Write-Host "`nList all revisions:" -ForegroundColor White
Write-Host "  gcloud run revisions list --service $ServiceName --region $Region" -ForegroundColor Gray
Write-Host "`nCheck Secret Manager secrets:" -ForegroundColor White
Write-Host "  gcloud secrets list" -ForegroundColor Gray
