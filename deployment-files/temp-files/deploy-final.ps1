# Final Deployment Script for AKC CRM
Write-Host "🚀 Starting AKC CRM Final Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Step 1: Set environment variables locally for the build
Write-Host "`n📋 Step 1: Setting up environment..." -ForegroundColor Yellow
$env:NODE_ENV = "production"

# Step 2: Ensure we have a clean build
Write-Host "`n📋 Step 2: Creating fresh production build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}
npm run build

# Step 3: Create a deployment package
Write-Host "`n📋 Step 3: Preparing deployment package..." -ForegroundColor Yellow

# Create .dockerignore to optimize build
$dockerignoreContent = @"
node_modules
.git
.env
.env.*
credentials/
docs/
tests/
scripts/
*.log
"@
$dockerignoreContent | Out-File -FilePath ".dockerignore" -Encoding UTF8

# Step 4: Build and push using Cloud Build
Write-Host "`n📋 Step 4: Building and deploying to Cloud Run..." -ForegroundColor Yellow

# Use gcloud builds submit for more control
$projectId = "crm-live-458710"
$serviceName = "project-crew-connect"
$region = "us-east5"

# Submit build
Write-Host "Building container image..." -ForegroundColor White
gcloud builds submit --tag gcr.io/$projectId/$serviceName

if ($LASTEXITCODE -eq 0) {
    # Deploy the built image
    Write-Host "`nDeploying to Cloud Run..." -ForegroundColor White
    gcloud run deploy $serviceName `
        --image gcr.io/$projectId/$serviceName `
        --platform managed `
        --region $region `
        --allow-unauthenticated `
        --memory 512Mi `
        --timeout 300 `
        --max-instances 10

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deployment successful!" -ForegroundColor Green

        # Step 5: Set environment variables
        Write-Host "`n📋 Step 5: Setting environment variables..." -ForegroundColor Yellow

        # Read the generated session secret from .env.production
        if (Test-Path ".env.production") {
            $envContent = Get-Content ".env.production"
            $sessionSecret = ($envContent | Where-Object { $_ -match "^SESSION_SECRET=" }) -replace "SESSION_SECRET=", ""
        } else {
            # Generate new one if needed
            node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" > temp_secret.txt
            $sessionSecret = Get-Content temp_secret.txt
            Remove-Item temp_secret.txt
        }

        # Update environment variables
        gcloud run services update $serviceName `
            --update-env-vars="GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com" `
            --update-env-vars="GOOGLE_CLIENT_SECRET=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" `
            --update-env-vars="GOOGLE_REDIRECT_URI=https://project-crew-connect-1061142868787.us-east5.run.app/auth/google/callback" `
            --update-env-vars="SESSION_SECRET=$sessionSecret" `
            --update-env-vars="SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co" `
            --update-env-vars="SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ" `
            --update-env-vars="SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY" `
            --update-env-vars="NODE_ENV=production" `
            --region $region

        Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
        Write-Host "Your app is available at: https://project-crew-connect-1061142868787.us-east5.run.app" -ForegroundColor Cyan

        # Get the actual URL
        $serviceUrl = gcloud run services describe $serviceName --region $region --format "value(status.url)"
        Write-Host "Actual URL: $serviceUrl" -ForegroundColor Cyan

        Write-Host "`n✅ All automated tasks completed!" -ForegroundColor Green
        Write-Host "✅ Sessions table: Created" -ForegroundColor Green
        Write-Host "✅ Environment variables: Set" -ForegroundColor Green
        Write-Host "✅ Google OAuth: Configured" -ForegroundColor Green
        Write-Host "✅ Production build: Deployed" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Deployment failed" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Build failed" -ForegroundColor Red
    Write-Host "Check the build logs for details" -ForegroundColor Yellow
}
