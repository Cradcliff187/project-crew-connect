# 🚀 Simple Deployment Instructions for AKC CRM

## What I've Done For You ✅

1. **Fixed all the code issues**

   - Payee selection now works correctly
   - UI labels are fixed ("Vendor Type" → "Payee Type")
   - Google Calendar integration is ready
   - Form data logging is fixed

2. **Created automatic setup scripts**
   - Environment variables are prepared
   - Session storage uses your existing Supabase database (no Redis needed!)
   - Debug endpoints are automatically disabled in production
   - Secure session secret is generated automatically

## What You Need To Do 📋

### Step 1: Run the Deployment Script

**If you're on Windows (PowerShell):**

```powershell
./deploy-to-production.ps1
```

**If you're on Mac/Linux:**

```bash
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

This script will:

- Generate a secure session secret
- Install all dependencies
- Build your application
- Deploy to Google Cloud Run

### Step 2: Apply the Sessions Table Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/sql/new
2. Copy and paste this SQL:

```sql
-- Create sessions table for storing Google OAuth sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  tokens JSONB NOT NULL,
  user_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_email ON sessions(user_email);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_sessions_updated_at();

-- Add comment
COMMENT ON TABLE sessions IS 'Stores Google OAuth session data for calendar integration';
```

3. Click "Run" button

### Step 3: Set Environment Variables

After running the deployment script, it will show you a long `gcloud` command. Copy and paste that entire command into your terminal and run it.

It will look something like this (but with your actual values):

```bash
gcloud run services update project-crew-connect \
  --set-env-vars="GOOGLE_CLIENT_ID=..." \
  --set-env-vars="GOOGLE_CLIENT_SECRET=..." \
  --set-env-vars="SESSION_SECRET=..." \
  --region us-east5
```

## That's It! 🎉

Your application will be deployed and available at:
https://project-crew-connect-1061142868787.us-east5.run.app

### Testing Google Calendar Integration

1. Go to Settings > Calendar Integration in your app
2. Click "Connect to Google Calendar"
3. Log in with your Google account
4. Grant calendar permissions
5. You should be redirected back to your app with "Connected" status

## Troubleshooting 🔧

**If deployment fails:**

- Make sure you have Node.js installed: https://nodejs.org/
- Make sure you have Google Cloud SDK installed: https://cloud.google.com/sdk/docs/install
- Make sure you're logged into gcloud: `gcloud auth login`

**If Google Calendar doesn't work:**

- Check that all environment variables were set correctly
- Make sure the sessions table was created in Supabase
- Check the logs: `gcloud run logs read --service project-crew-connect --region us-east5`

## Summary 📝

Everything has been automated for you! You just need to:

1. Run one deployment script
2. Copy/paste SQL into Supabase
3. Copy/paste the environment variables command

The app handles everything else automatically, including:

- Secure session management
- Proper error logging
- Google Calendar OAuth flow
- All the bug fixes you requested

Good luck with your deployment! 🚀
