Write-Host "`n🚀 LAUNCHING YOUR AUTHENTICATED CLOUD RUN APP" -ForegroundColor Green -BackgroundColor DarkGreen
Write-Host "================================================" -ForegroundColor Green

# Make sure user is authenticated
Write-Host "`n📋 Checking authentication..." -ForegroundColor Yellow
$currentUser = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null

if ($currentUser -like "*@austinkunzconstruction.com") {
    Write-Host "✅ Authenticated as: $currentUser" -ForegroundColor Green
} else {
    Write-Host "❌ Not authenticated with austinkunzconstruction.com domain" -ForegroundColor Red
    Write-Host "`nPlease run: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

# Start the proxy
Write-Host "`n🔐 Starting authenticated proxy to Cloud Run..." -ForegroundColor Cyan
Write-Host "This will open your app at http://localhost:8080" -ForegroundColor White
Write-Host "`nPress Ctrl+C to stop the proxy when done" -ForegroundColor Gray

# Open browser after a short delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:8080"
} | Out-Null

# Run the proxy (this will keep running until Ctrl+C)
gcloud run services proxy project-crew-connect --region=us-east5 --port=8080
