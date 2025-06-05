Write-Host "`n================================" -ForegroundColor Yellow
Write-Host "DEPLOYMENT FIX - STEP BY STEP" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Yellow

Write-Host "📋 CURRENT PROBLEM:" -ForegroundColor Red
Write-Host "The 'project-crew-connect' service account lacks permissions to push Docker images." -ForegroundColor White
Write-Host "This is why your build failed with 'Permission denied' error.`n" -ForegroundColor White

Write-Host "🔧 SOLUTION:" -ForegroundColor Green
Write-Host "Grant the missing permissions to the service account.`n" -ForegroundColor White

# Set project
$PROJECT_ID = "crm-live-458710"
$SERVICE_ACCOUNT = "project-crew-connect@${PROJECT_ID}.iam.gserviceaccount.com"

Write-Host "📌 Setting project context..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

Write-Host "`n🚀 Granting Artifact Registry Writer permission..." -ForegroundColor Cyan
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/artifactregistry.writer" `
    --condition=None

Write-Host "`n🏃 Granting Cloud Run Admin permission..." -ForegroundColor Cyan
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/run.admin" `
    --condition=None

Write-Host "`n👤 Granting Service Account User permission..." -ForegroundColor Cyan
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SERVICE_ACCOUNT}" `
    --role="roles/iam.serviceAccountUser" `
    --condition=None

Write-Host "`n✅ Permissions granted successfully!" -ForegroundColor Green

Write-Host "`n📍 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=crm-live-458710" -ForegroundColor Cyan
Write-Host "2. Click 'RUN' on your 'deploy-main-to-cloud-run' trigger" -ForegroundColor Cyan
Write-Host "3. This will start a new build with the correct permissions" -ForegroundColor Cyan

Write-Host "`n🎯 OR push a small change to trigger automatically:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Gray
Write-Host '   git commit -m "Trigger rebuild after fixing permissions"' -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
