# Fix Google OAuth 403 Errors

## The Problem

Google OAuth is returning 403 errors because the redirect URIs don't match what's configured in the Google Console.

## Solution

### 1. Update Google OAuth Console

Go to: https://console.cloud.google.com/apis/credentials?project=crm-live-458710

Edit your OAuth 2.0 Client ID and add ALL of these to **Authorized redirect URIs**:

```
https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/callback
https://project-crew-connect-1061142868787.us-east5.run.app/auth/callback
https://zrxezqllmpdlhiudutme.supabase.co/auth/v1/callback
http://localhost:5173/auth/callback
http://localhost:8080/auth/callback
```

Also add to **Authorized JavaScript origins**:

```
https://project-crew-connect-dbztoro5pq-ul.a.run.app
https://project-crew-connect-1061142868787.us-east5.run.app
http://localhost:5173
http://localhost:8080
```

### 2. Update Supabase Dashboard

Go to: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/auth/url-configuration

Set **Site URL** to:

```
https://project-crew-connect-dbztoro5pq-ul.a.run.app
```

Add to **Redirect URLs**:

```
https://project-crew-connect-dbztoro5pq-ul.a.run.app/*
http://localhost:5173/*
```

### 3. Important Notes

- The URL with the client ID (`project-crew-connect-1061142868787.us-east5.run.app`) is generated by Google OAuth
- You must add BOTH the standard Cloud Run URL and the one with the client ID
- Changes to Google OAuth can take 5-10 minutes to propagate

### 4. Test After Changes

1. Clear your browser cookies/cache
2. Try signing in again
3. If still getting 403, wait 10 minutes and try again

## Code Fix Applied

Updated `src/contexts/AuthContext.tsx` to use explicit production URL instead of `window.location.origin`.
