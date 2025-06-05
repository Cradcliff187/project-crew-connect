Write-Host "`n🚀 FIX DEPLOYMENT PERMISSIONS" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host "`nThis script will open browser pages to fix the permission issues." -ForegroundColor Cyan

# Step 1: Open IAM page to add permissions
Write-Host "`n📋 Step 1: Grant Permissions to Service Account" -ForegroundColor Green
Write-Host "Opening IAM page in your browser..." -ForegroundColor Gray
Write-Host "`nYou need to:" -ForegroundColor Yellow
Write-Host "1. Find 'project-crew-connect@crm-live-458710.iam.gserviceaccount.com'" -ForegroundColor White
Write-Host "2. Click the pencil icon to edit" -ForegroundColor White
Write-Host "3. Add these roles:" -ForegroundColor White
Write-Host "   - Artifact Registry Writer" -ForegroundColor Cyan
Write-Host "   - Cloud Run Admin" -ForegroundColor Cyan
Write-Host "   - Service Account User" -ForegroundColor Cyan
Write-Host "4. Click 'Save'" -ForegroundColor White

Start-Process "https://console.cloud.google.com/iam-admin/iam?project=crm-live-458710"

Write-Host "`nPress any key when you've added the permissions..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 2: Trigger a new build
Write-Host "`n📦 Step 2: Trigger New Build" -ForegroundColor Green
Write-Host "Opening Cloud Build triggers page..." -ForegroundColor Gray
Write-Host "`nClick 'RUN' on the 'deploy-main-to-cloud-run' trigger" -ForegroundColor Yellow

Start-Process "https://console.cloud.google.com/cloud-build/triggers?project=crm-live-458710"

Write-Host "`nPress any key when you've triggered the build..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 3: Monitor the build
Write-Host "`n👀 Step 3: Monitor Build Progress" -ForegroundColor Green
Write-Host "Opening build history page..." -ForegroundColor Gray

Start-Process "https://console.cloud.google.com/cloud-build/builds?project=crm-live-458710"

Write-Host "`n✅ Your build should now be running with proper permissions!" -ForegroundColor Green
Write-Host "`nOnce the build succeeds, your app will be available at:" -ForegroundColor Cyan
Write-Host "https://project-crew-connect-dbztoro5pq-ul.a.run.app" -ForegroundColor White

# Alternative: Use gcloud with browser auth
Write-Host "`n💡 Alternative: Grant permissions via command line" -ForegroundColor Yellow
Write-Host "If you prefer, run these commands (they will open browser for auth):" -ForegroundColor Gray
Write-Host "`ngcloud auth login" -ForegroundColor White
Write-Host "gcloud projects add-iam-policy-binding crm-live-458710 --member=serviceAccount:project-crew-connect@crm-live-458710.iam.gserviceaccount.com --role=roles/artifactregistry.writer" -ForegroundColor White
Write-Host "gcloud projects add-iam-policy-binding crm-live-458710 --member=serviceAccount:project-crew-connect@crm-live-458710.iam.gserviceaccount.com --role=roles/run.admin" -ForegroundColor White
Write-Host "gcloud projects add-iam-policy-binding crm-live-458710 --member=serviceAccount:project-crew-connect@crm-live-458710.iam.gserviceaccount.com --role=roles/iam.serviceAccountUser" -ForegroundColor White
