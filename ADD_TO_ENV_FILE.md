# Add These to Your .env File

You already have all the required files and IDs! Just add these 5 lines to your `.env`:

```env
# Service Account (from your existing file)
GOOGLE_SERVICE_ACCOUNT_EMAIL=calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<see command below to generate>

# Frontend Calendar IDs (using your existing IDs with VITE_ prefix)
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com

# Webhook Security Token
WEBHOOK_TOKEN=xK9mN3pQ7rT5vW2yA8bC4dF6gH1jL0
```

## Generate the Base64 Key

Run this PowerShell command to convert your existing service account file:

```powershell
$json = Get-Content -Path ".\credentials\calendar-service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Host "Base64 key copied to clipboard! Paste it as GOOGLE_SERVICE_ACCOUNT_KEY_BASE64"
```

## That's It! 🎉

You already have:

- ✅ Service account file (`calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com`)
- ✅ Calendar IDs (Projects: `c_9922ed38...`, Work Orders: `c_ad5019e5...`)
- ✅ Supabase credentials
- ✅ Google OAuth credentials

Just:

1. Run the PowerShell command above
2. Add these 5 lines to your `.env`
3. Deploy!

## Quick Verification

After adding to `.env`, test with:

```powershell
# Should show your service account email
Write-Host $env:GOOGLE_SERVICE_ACCOUNT_EMAIL

# Should show your calendar IDs
Write-Host $env:VITE_GOOGLE_CALENDAR_PROJECTS
Write-Host $env:VITE_GOOGLE_CALENDAR_WORK_ORDER
```
