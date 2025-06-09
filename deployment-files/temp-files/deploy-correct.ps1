Write-Host "Starting AKC CRM Final Deployment" -ForegroundColor Cyan

# Build the app
Write-Host "Building production bundle..." -ForegroundColor Yellow
npm run build

# Create dockerignore
Write-Host "Creating .dockerignore..." -ForegroundColor Yellow
"node_modules
.git
.env
.env.*
credentials/
docs/
tests/
scripts/
*.log" | Out-File -FilePath ".dockerignore" -Encoding UTF8

# Deploy using Cloud Build
Write-Host "Deploying to Cloud Run..." -ForegroundColor Yellow
gcloud builds submit --tag gcr.io/crm-live-458710/project-crew-connect

if ($LASTEXITCODE -eq 0) {
    # Deploy the image
    gcloud run deploy project-crew-connect `
        --image gcr.io/crm-live-458710/project-crew-connect `
        --platform managed `
        --region us-east5 `
        --allow-unauthenticated `
        --memory 512Mi `
        --timeout 300

    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful!" -ForegroundColor Green

        # Set environment variables
        Write-Host "Setting environment variables..." -ForegroundColor Yellow

        # Read session secret
        $sessionSecret = "ca20ff7488080162db4b02602cf22c7602ef2065c1d2352c0f630a347429d1ffe63c1e58a84c7d38044d5dc00b7af2653ff69319f0f2bc3baf5299c937a03bc5"

        gcloud run services update project-crew-connect `
            --update-env-vars="NODE_ENV=production,GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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" `
            --region us-east5

        gcloud run services update project-crew-connect `
            --update-env-vars="GOOGLE_REDIRECT_URI=https://project-crew-connect-1061142868787.us-east5.run.app/auth/google/callback,SESSION_SECRET=$sessionSecret" `
            --region us-east5

        gcloud run services update project-crew-connect `
            --update-env-vars="SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co,SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ" `
            --region us-east5

        gcloud run services update project-crew-connect `
            --update-env-vars="SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY" `
            --region us-east5

        Write-Host "Deployment Complete!" -ForegroundColor Green
        Write-Host "Your app is available at: https://project-crew-connect-1061142868787.us-east5.run.app" -ForegroundColor Cyan
    }
}
