# 🔧 Fix OAuth Redirect Issue

## The Problem

After logging in with Google, you're being redirected to `localhost` which doesn't exist. This happens because the Google OAuth app doesn't have your live app's redirect URL configured.

## The Solution - Add Redirect URIs

### Step 1: Find Your OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials?project=crm-live-458710
2. Look for your OAuth 2.0 Client ID (probably named something like "Web client 1" or similar)
3. Click on it to edit

### Step 2: Add Authorized Redirect URIs

Add these TWO redirect URIs:

```
https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/callback
https://zrxezqllmpdlhiudutme.supabase.co/auth/v1/callback
```

### Step 3: Also Add Authorized JavaScript Origins

Add your live app URL:

```
https://project-crew-connect-dbztoro5pq-ul.a.run.app
```

### Step 4: Save Changes

1. Click "SAVE" at the bottom
2. Wait a few minutes for changes to propagate

### Step 5: Test Again

1. Clear your browser cookies/cache (or use incognito mode)
2. Go to: https://project-crew-connect-dbztoro5pq-ul.a.run.app
3. Click "Sign in with Google"
4. It should now redirect back to your live app!

## Important Notes

- Changes may take 5-10 minutes to take effect
- Make sure to add BOTH redirect URIs
- The Supabase URL is needed because Supabase handles the OAuth flow
