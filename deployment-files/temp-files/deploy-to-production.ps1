# PowerShell deployment script for Windows users

Write-Host "🚀 AKC CRM One-Click Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js first from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud --version | Select-Object -First 1
    Write-Host "✅ Google Cloud SDK is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Google Cloud SDK is not installed" -ForegroundColor Red
    Write-Host "Please install it from https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Step 1: Generating secure environment variables..." -ForegroundColor Yellow
node setup-deployment-env.cjs

Write-Host ""
Write-Host "📋 Step 2: Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "📋 Step 3: Building the application..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "📋 Step 4: Deploying to Google Cloud Run..." -ForegroundColor Yellow
gcloud run deploy project-crew-connect `
  --source . `
  --region us-east5 `
  --allow-unauthenticated

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: You still need to:" -ForegroundColor Yellow
Write-Host "1. Run the sessions table migration in Supabase" -ForegroundColor White
Write-Host "2. Set the environment variables using the gcloud command from setup-deployment-env.js" -ForegroundColor White
Write-Host ""
Write-Host "Your app will be available at: https://project-crew-connect-1061142868787.us-east5.run.app" -ForegroundColor Cyan
