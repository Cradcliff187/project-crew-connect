# Setup Secrets Script - Uses the provided credentials to configure Secret Manager

$PROJECT_ID = "crm-live-458710"
$WORKSPACE_DOMAIN = "akconstructionky.com"  # Please update this with your actual domain

Write-Host "Setting up secrets for project: $PROJECT_ID" -ForegroundColor Green

# Set the project
gcloud config set project $PROJECT_ID

# Function to create or update a secret
function Set-Secret {
    param($SecretName, $SecretValue)

    # Check if secret exists
    $null = gcloud secrets describe $SecretName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Updating existing secret: $SecretName" -ForegroundColor Yellow
        echo $SecretValue | gcloud secrets versions add $SecretName --data-file=-
    } else {
        Write-Host "Creating new secret: $SecretName" -ForegroundColor Green
        echo $SecretValue | gcloud secrets create $SecretName --data-file=- --replication-policy="automatic"
    }
}

Write-Host ""
Write-Host "Creating/updating secrets in Secret Manager..." -ForegroundColor Green

# Set all the secrets
Set-Secret "supabase-url" "https://zrxezqllmpdlhiudutme.supabase.co"
Set-Secret "supabase-anon-key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ"
Set-Secret "supabase-service-role-key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY"
Set-Secret "google-client-id" "1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com"
Set-Secret "google-client-secret" "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"
Set-Secret "google-calendar-project" "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
Set-Secret "google-calendar-work-order" "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"
Set-Secret "webhook-url" "https://zrxezqllmpdlhiudutme.functions.supabase.co/calendarWebhook"
Set-Secret "google-maps-api-key" "AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I"

Write-Host ""
Write-Host "All secrets have been configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Next, run the full setup script to complete the deployment pipeline:" -ForegroundColor Yellow
Write-Host ".\setup-deployment-continued.ps1" -ForegroundColor Blue
