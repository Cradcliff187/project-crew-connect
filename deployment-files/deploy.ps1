# Quick deployment script for AKC Revisions
# Run this after making changes and pushing to Git

Write-Host "🚀 Deploying AKC Revisions to Google Cloud..." -ForegroundColor Green

# Check if user is authenticated
$authCheck = gcloud auth list --filter="status:ACTIVE" --format="value(account)"
if (-not $authCheck) {
    Write-Host "❌ Please authenticate first: gcloud auth login" -ForegroundColor Red
    exit 1
}

# Get current commit for deployment tracking
$currentCommit = git rev-parse --short HEAD
Write-Host "📝 Deploying commit: $currentCommit" -ForegroundColor Yellow

# Submit build
Write-Host "🔨 Starting Cloud Build..." -ForegroundColor Blue
gcloud builds submit --config=cloudbuild.yaml .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Your app is live at: https://project-crew-connect-dbztoro5pq-ul.a.run.app" -ForegroundColor Cyan
    Write-Host "📊 Monitor at: https://console.cloud.google.com/run?project=crm-live-458710" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed. Check build logs in GCP Console." -ForegroundColor Red
    Write-Host "🔍 Build logs: https://console.cloud.google.com/cloud-build/builds?project=crm-live-458710" -ForegroundColor Yellow
}
