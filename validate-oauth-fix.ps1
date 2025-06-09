# OAuth Fix Validation Script
# This script validates the OAuth fix deployment and runs automated tests

Write-Host "🔍 OAuth Fix Validation Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Check deployment status
Write-Host "`n📦 Step 1: Checking deployment status..." -ForegroundColor Yellow
try {
    $serviceUrl = gcloud run services describe project-crew-connect --region=us-east5 --project=crm-live-458710 --format="value(status.url)" 2>$null
    if ($serviceUrl) {
        Write-Host "✅ Service URL: $serviceUrl" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to get service URL" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error checking deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check recent logs for OAuth fix
Write-Host "`n🔍 Step 2: Checking recent logs for OAuth fix..." -ForegroundColor Yellow
try {
    Write-Host "Retrieving last 20 log entries..." -ForegroundColor Gray
    $logs = gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=20 2>$null

    if ($logs -match "After trimming:") {
        Write-Host "✅ OAuth fix deployed - found trimming logs" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OAuth fix may not be deployed yet - no trimming logs found" -ForegroundColor Yellow
    }

    if ($logs -match "%0D%0A") {
        Write-Host "❌ Still finding newline characters in logs" -ForegroundColor Red
    } else {
        Write-Host "✅ No newline characters found in recent logs" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking logs: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test service accessibility
Write-Host "`n🌐 Step 3: Testing service accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $serviceUrl -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Service is accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Service responded with HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Service not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test OAuth endpoint
Write-Host "`n🔐 Step 4: Testing OAuth endpoint..." -ForegroundColor Yellow
try {
    $oauthUrl = "$serviceUrl/auth/google"
    $response = Invoke-WebRequest -Uri $oauthUrl -Method GET -TimeoutSec 10 -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue

    if ($response.StatusCode -eq 302) {
        Write-Host "✅ OAuth endpoint redirects correctly (HTTP 302)" -ForegroundColor Green

        # Check if redirect URL contains Google OAuth
        $location = $response.Headers.Location
        if ($location -and $location.Contains("accounts.google.com")) {
            Write-Host "✅ Redirects to Google OAuth (accounts.google.com)" -ForegroundColor Green

            # Check for invalid_client in redirect URL
            if ($location.Contains("invalid_client")) {
                Write-Host "❌ OAuth redirect contains invalid_client error" -ForegroundColor Red
            } else {
                Write-Host "✅ No invalid_client error in OAuth redirect" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  OAuth redirect may not be to Google: $location" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  OAuth endpoint returned HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ OAuth endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Check for OAuth flow logs
Write-Host "`n📊 Step 5: Checking for OAuth flow logs..." -ForegroundColor Yellow
try {
    Write-Host "Looking for OAuth flow indicators in logs..." -ForegroundColor Gray
    $oauthLogs = gcloud run services logs read project-crew-connect --project=crm-live-458710 --region=us-east5 --limit=50 2>$null | Select-String -Pattern "OAuth|client_id|redirect"

    if ($oauthLogs) {
        Write-Host "✅ Found OAuth flow logs:" -ForegroundColor Green
        $oauthLogs | ForEach-Object { Write-Host "  $($_.Line)" -ForegroundColor Gray }
    } else {
        Write-Host "⚠️  No recent OAuth flow logs found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error checking OAuth logs: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n📋 VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Service URL: $serviceUrl" -ForegroundColor White
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor White

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Green
Write-Host "1. Wait 2-3 minutes for full deployment" -ForegroundColor White
Write-Host "2. Navigate to: $serviceUrl" -ForegroundColor White
Write-Host "3. Go to Settings → Calendar" -ForegroundColor White
Write-Host "4. Click 'Connect Google Calendar'" -ForegroundColor White
Write-Host "5. Verify NO 'Error 401: invalid_client' appears" -ForegroundColor White

Write-Host "`n📚 For detailed testing, see: OAUTH_TESTING_VALIDATION_RUBRIC.md" -ForegroundColor Cyan
