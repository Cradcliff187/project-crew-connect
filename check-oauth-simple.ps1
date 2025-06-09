# OAuth Configuration Checker
Write-Host "=== OAUTH CONFIGURATION CHECK ===" -ForegroundColor Cyan
Write-Host ""

$projectId = "crm-live-458710"
$region = "us-east5"
$serviceName = "project-crew-connect"

# Get Cloud Run service URL
Write-Host "Getting Cloud Run Service URL..." -ForegroundColor Yellow
$serviceUrl = gcloud run services describe $serviceName --region=$region --project=$projectId --format="value(status.url)"
Write-Host "Service URL: $serviceUrl" -ForegroundColor Green

# Get OAuth environment variables
Write-Host ""
Write-Host "Getting OAuth Environment Variables..." -ForegroundColor Yellow
gcloud run services describe $serviceName --region=$region --project=$projectId --format="yaml(spec.template.spec.containers[0].env)" | Select-String -Pattern "GOOGLE|REDIRECT|SUPABASE|CLIENT"

# Expected redirect URI
Write-Host ""
Write-Host "Expected Redirect URI:" -ForegroundColor Cyan
Write-Host "$serviceUrl/auth/google/callback" -ForegroundColor Green

# Check OAuth brands
Write-Host ""
Write-Host "Checking OAuth Brands..." -ForegroundColor Yellow
gcloud alpha iap oauth-brands list --project=$projectId 2>$null

# Check local files
Write-Host ""
Write-Host "Checking Local Configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "Found .env file" -ForegroundColor Green
    Get-Content .env | Select-String -Pattern "GOOGLE|SUPABASE|REDIRECT" | ForEach-Object {
        $line = $_.Line
        if ($line -match "secret|key|password" -and $line -notmatch "REDIRECT") {
            Write-Host "[REDACTED]" -ForegroundColor Gray
        } else {
            Write-Host $line -ForegroundColor White
        }
    }
}

# Check server.cjs
if (Test-Path "server.cjs") {
    Write-Host ""
    Write-Host "OAuth config in server.cjs:" -ForegroundColor Yellow
    Get-Content server.cjs | Select-String -Pattern "callbackURL|redirectUri|GOOGLE_REDIRECT_URI" | ForEach-Object {
        Write-Host $_.Line.Trim() -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "OAUTH CLIENT CONFIGURATION:" -ForegroundColor Magenta
Write-Host "To verify/update redirect URIs in Google Cloud Console:" -ForegroundColor Yellow
Write-Host "https://console.cloud.google.com/apis/credentials?project=$projectId" -ForegroundColor White
