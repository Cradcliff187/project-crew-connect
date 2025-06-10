Write-Host "=== CALENDAR INTEGRATION VERIFICATION ===" -ForegroundColor Cyan
Write-Host ""

# Check deployment status
Write-Host "1. Checking latest deployment status..." -ForegroundColor Yellow
gcloud builds list --limit=1 --format="table(id,status,createTime,finishTime)"
Write-Host ""

# Wait for user to confirm deployment is complete
Write-Host "Please wait for the deployment to complete (about 5-10 minutes)." -ForegroundColor Yellow
Write-Host "Once the deployment shows SUCCESS, press Enter to continue..." -ForegroundColor Yellow
Read-Host

# Test the production endpoint
Write-Host "2. Testing production endpoint..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "https://project-crew-connect-dbztoro5pq-ul.a.run.app/" -UseBasicParsing
if ($response.StatusCode -eq 200) {
    Write-Host "[OK] Production site is accessible" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Production site returned status code: $($response.StatusCode)" -ForegroundColor Red
}
Write-Host ""

# Check if calendar variables are in the built JavaScript
Write-Host "3. Checking if calendar IDs are in the production build..." -ForegroundColor Yellow
$jsContent = $response.Content
if ($jsContent -match "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5") {
    Write-Host "[OK] Projects Calendar ID found in production build" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Projects Calendar ID NOT found in production build" -ForegroundColor Red
}
if ($jsContent -match "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3") {
    Write-Host "[OK] Work Orders Calendar ID found in production build" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Work Orders Calendar ID NOT found in production build" -ForegroundColor Red
}
Write-Host ""

# Instructions for manual testing
Write-Host "4. Manual Testing Steps:" -ForegroundColor Yellow
Write-Host "   a. Open https://project-crew-connect-dbztoro5pq-ul.a.run.app in your browser" -ForegroundColor White
Write-Host "   b. Open Developer Console (F12)" -ForegroundColor White
Write-Host "   c. Create a new project or schedule item" -ForegroundColor White
Write-Host "   d. Look for these console messages:" -ForegroundColor White
Write-Host "      - 'Using Projects Calendar (c_9922...)' - NOT 'primary'" -ForegroundColor Green
Write-Host "      - 'Calendar event created successfully'" -ForegroundColor Green
Write-Host "   e. Check Google Calendar to verify event appeared in Projects Calendar" -ForegroundColor White
Write-Host ""

Write-Host "5. Expected Results:" -ForegroundColor Yellow
Write-Host "   [OK] NO warning about 'VITE_GOOGLE_CALENDAR_PROJECTS/PROJECT not configured'" -ForegroundColor Green
Write-Host "   [OK] Events appear in shared calendars, NOT personal calendar" -ForegroundColor Green
Write-Host "   [OK] Projects -> Projects Calendar" -ForegroundColor Green
Write-Host "   [OK] Work Orders -> Work Orders Calendar" -ForegroundColor Green
Write-Host ""

Write-Host "Press Enter to exit..." -ForegroundColor Yellow
Read-Host
