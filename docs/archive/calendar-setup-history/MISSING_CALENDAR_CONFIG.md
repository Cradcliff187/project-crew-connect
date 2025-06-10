# Missing Calendar Configuration Items

## ✅ What You Already Have

Looking at your `env-template.txt`, you already have:

1. **Supabase Credentials** ✓

   - `SUPABASE_URL`: ✓ zrxezqllmpdlhiudutme.supabase.co
   - `SUPABASE_ANON_KEY`: ✓
   - `SUPABASE_SERVICE_ROLE_KEY`: ✓

2. **Google OAuth** ✓

   - `GOOGLE_CLIENT_ID`: ✓ 1061142868787-...
   - `GOOGLE_CLIENT_SECRET`: ✓ GOCSPX-...

3. **Shared Calendar IDs** ✓

   - `GOOGLE_CALENDAR_PROJECT`: ✓ c_9922ed38...@group.calendar.google.com
   - `GOOGLE_CALENDAR_WORK_ORDER`: ✓ c_ad5019e5...@group.calendar.google.com

4. **Webhook URL** ✓
   - Already configured for your Supabase project

## ❌ What's Actually Missing

### 1. Service Account Credentials

You reference a service account file but need to:

```env
# You have this path reference:
GOOGLE_APPLICATION_CREDENTIALS=./credentials/calendar-service-account.json

# But you need these for production:
GOOGLE_SERVICE_ACCOUNT_EMAIL=??? # e.g., akc-calendar@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=??? # Base64 encoded JSON key
```

### 2. VITE\_ Prefix for Frontend

The frontend needs these with VITE\_ prefix:

```env
# Add these (using your existing calendar IDs):
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
```

### 3. Webhook Token

```env
# Generate a secure token:
WEBHOOK_TOKEN=??? # Generate with: openssl rand -hex 32
```

## 🚀 Quick Setup Commands

### 1. Generate Webhook Token (PowerShell)

```powershell
# Generate secure token
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### 2. Convert Service Account Key to Base64 (PowerShell)

```powershell
# If you have the JSON file already:
$json = Get-Content -Path ".\credentials\calendar-service-account.json" -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64 | Set-Clipboard
Write-Host "Base64 key copied to clipboard!"
```

### 3. Get Service Account Email

Look in your `calendar-service-account.json` file for:

```json
{
  "client_email": "this-is-what-you-need@your-project.iam.gserviceaccount.com",
  ...
}
```

## 📋 Complete Missing Values

Add these to your `.env`:

```env
# Service Account (from your JSON file)
GOOGLE_SERVICE_ACCOUNT_EMAIL=<find in calendar-service-account.json>
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<base64 encode the JSON file>

# Frontend Calendar IDs (copy from your existing values)
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com

# Webhook Security
WEBHOOK_TOKEN=<generate-32-char-random-string>
```

That's it! You're actually very close - just need these 5 environment variables and you'll be fully configured. 🎉
