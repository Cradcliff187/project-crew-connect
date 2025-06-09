# Verify OAuth Configurations in Google Cloud and Supabase
Write-Host "=== VERIFYING OAUTH CONFIGURATIONS ===" -ForegroundColor Cyan
Write-Host ""

$projectId = "crm-live-458710"
$region = "us-east5"
$serviceName = "project-crew-connect"

Write-Host "1. GOOGLE CLOUD CONFIGURATION" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

# Get Cloud Run service URL
Write-Host "`nChecking Cloud Run Service..." -ForegroundColor White
$serviceUrl = gcloud run services describe $serviceName --region=$region --project=$projectId --format="value(status.url)"
Write-Host "Service URL: $serviceUrl" -ForegroundColor Green

# Get environment variables related to OAuth
Write-Host "`nChecking OAuth Environment Variables..." -ForegroundColor White
$envVars = gcloud run services describe $serviceName --region=$region --project=$projectId --format="json" | ConvertFrom-Json
$oauthVars = $envVars.spec.template.spec.containers[0].env | Where-Object { $_.name -match "GOOGLE|REDIRECT|CLIENT|SUPABASE" }

Write-Host "`nOAuth-related Environment Variables:" -ForegroundColor Cyan
foreach ($var in $oauthVars) {
    if ($var.value) {
        Write-Host "$($var.name): $($var.value)" -ForegroundColor White
    } else {
        Write-Host "$($var.name): [Secret]" -ForegroundColor Gray
    }
}

# Get OAuth client info
Write-Host "`n2. OAUTH CLIENT CONFIGURATION" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

Write-Host "`nChecking OAuth Brands..." -ForegroundColor White
$brands = gcloud alpha iap oauth-brands list --project=$projectId --format=json 2>$null | ConvertFrom-Json
if ($brands) {
    foreach ($brand in $brands) {
        Write-Host "Brand: $($brand.applicationTitle)" -ForegroundColor Green
        Write-Host "Support Email: $($brand.supportEmail)" -ForegroundColor White
    }
}

Write-Host "`nChecking OAuth Clients..." -ForegroundColor White
$clients = gcloud alpha iap oauth-clients list projects/$projectId/brands/$projectId --project=$projectId --format=json 2>$null | ConvertFrom-Json
if ($clients) {
    foreach ($client in $clients) {
        Write-Host "Client: $($client.displayName)" -ForegroundColor Green
        Write-Host "Client ID: $($client.name.Split('/')[-1])" -ForegroundColor White
    }
}

Write-Host "`n3. EXPECTED vs ACTUAL CONFIGURATION" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

Write-Host "`nExpected Redirect URI:" -ForegroundColor Cyan
Write-Host "$serviceUrl/auth/google/callback" -ForegroundColor Green

Write-Host "`nConfigured Redirect URIs in Environment:" -ForegroundColor Cyan
$redirectUri = ($oauthVars | Where-Object { $_.name -eq "GOOGLE_REDIRECT_URI" }).value
if ($redirectUri) {
    Write-Host "GOOGLE_REDIRECT_URI: $redirectUri" -ForegroundColor White
    if ($redirectUri -eq "$serviceUrl/auth/google/callback") {
        Write-Host "✓ Redirect URI matches service URL" -ForegroundColor Green
    } else {
        Write-Host "✗ Redirect URI mismatch!" -ForegroundColor Red
    }
}

Write-Host "`n4. SUPABASE CONFIGURATION" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

# Check Supabase URL from environment
$supabaseUrl = ($oauthVars | Where-Object { $_.name -eq "SUPABASE_URL" }).value
if ($supabaseUrl) {
    Write-Host "Supabase URL: [Configured via Secret]" -ForegroundColor Green
} else {
    Write-Host "Supabase URL: Not found in environment" -ForegroundColor Red
}

Write-Host "`n5. CHECKING LOCAL CONFIGURATION FILES" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Check for .env files
if (Test-Path ".env") {
    Write-Host "Found .env file" -ForegroundColor Green
    $envContent = Get-Content .env | Where-Object { $_ -match "GOOGLE|SUPABASE|REDIRECT" }
    foreach ($line in $envContent) {
        if ($line -match '^([^=]+)=(.*)') {
            $key = $matches[1]
            $value = $matches[2]
            if ($value -match "secret|key|password") {
                Write-Host "$key=[REDACTED]" -ForegroundColor Gray
            } else {
                Write-Host "$line" -ForegroundColor White
            }
        }
    }
}

# Check server configuration
if (Test-Path "server.cjs") {
    Write-Host "`nChecking server.cjs for OAuth configuration..." -ForegroundColor White
    $serverContent = Get-Content server.cjs | Select-String -Pattern "callbackURL|redirectUri|GOOGLE_REDIRECT_URI"
    if ($serverContent) {
        Write-Host "Found OAuth configuration in server.cjs:" -ForegroundColor Green
        $serverContent | ForEach-Object { Write-Host $_.Line.Trim() -ForegroundColor Gray }
    }
}

Write-Host "`n6. MANUAL VERIFICATION NEEDED" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Write-Host "To see the actual redirect URIs configured in Google Cloud Console:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.cloud.google.com/apis/credentials?project=$projectId" -ForegroundColor White
Write-Host "2. Click on your OAuth 2.0 Client ID" -ForegroundColor White
Write-Host "3. Check the 'Authorized redirect URIs' section" -ForegroundColor White
Write-Host ""
Write-Host "The redirect URI should be: $($serviceUrl)/auth/google/callback" -ForegroundColor Green
