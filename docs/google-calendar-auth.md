# Google Calendar Authentication Guide

This document explains how the Google Calendar authentication flow works in this application and provides guidance for troubleshooting common issues.

## Authentication Flow

1. **User Initiates Authentication**

   - User clicks "Connect to Google Calendar" in Settings > Google Calendar
   - Frontend calls the `login()` function in `useGoogleCalendar` hook
   - Browser redirects to `/auth/google` endpoint

2. **Backend OAuth Initiation**

   - Backend generates Google OAuth URL with required scopes
   - Redirects user to Google's consent screen

3. **Google Authentication**

   - User logs in to Google (if not already logged in)
   - User grants required permissions
   - Google redirects back to our callback URL with an authorization code

4. **Token Exchange**

   - Backend receives the code at `/auth/google/callback`
   - Exchanges code for access and refresh tokens
   - Fetches user info (email, name, picture)
   - Stores tokens and user info in session
   - Redirects to frontend with `auth_success=true` parameter

5. **Frontend State Update**
   - Frontend detects the `auth_success` parameter
   - Calls `/api/auth/status` to verify authentication
   - Updates UI to show connected state if authenticated

## Required Scopes

The application requests these Google API scopes:

```javascript
[
  'https://www.googleapis.com/auth/calendar', // Read/write calendar access
  'https://www.googleapis.com/auth/gmail.modify', // Read/write Gmail access
  'https://www.googleapis.com/auth/drive', // Drive access
  'https://www.googleapis.com/auth/spreadsheets', // Spreadsheets access
  'https://www.googleapis.com/auth/documents', // Documents access
  'https://www.googleapis.com/auth/userinfo.profile', // User profile info
  'https://www.googleapis.com/auth/userinfo.email', // User email
];
```

## Authentication Storage

1. **Backend (Express.js)**

   - Uses `express-session` middleware to store tokens
   - Session cookie is HTTP-only for security
   - Session data includes tokens, user email, and profile info

2. **Frontend (React)**
   - Uses `useGoogleCalendar` hook to manage auth state
   - Checks authentication status on initial load
   - Provides login/logout functions and auth state

## Common Issues and Solutions

### Port Mismatch

**Issue**: Google OAuth redirect URL doesn't match the frontend port.

**Solution**:

1. Check the `REDIRECT_URI` in `server/server.js`:
   ```javascript
   const REDIRECT_URI =
     process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8081/auth/google/callback';
   ```
2. Ensure it matches the actual port your frontend is running on
3. If needed, update the redirect URI in Google Cloud Console

### "Not Connected" State Persists

**Issue**: UI still shows "Connect" even after successful authentication.

**Solution**:

1. Check browser console for errors
2. Visit `/auth/clear` endpoint to reset authentication state
3. Try authentication flow again with browser dev tools open
4. Verify that `/api/auth/status` returns `{authenticated: true}`

### Wrong User Authenticated

**Issue**: The system is using a different Google account than expected.

**Solution**:

1. Go to `/auth/clear` to clear current session
2. Clear Google cookies in your browser
3. Try authentication again, ensuring you select the correct account
4. Check server logs for "Using authenticated user:" message

## Testing Authentication

1. **Reset Authentication**

   - Visit `/auth/clear` endpoint to clear session

2. **Authenticate**

   - Go to Settings > Google Calendar
   - Click "Connect to Google Calendar"
   - Complete Google OAuth flow

3. **Verify**
   - Check that UI shows connected state
   - Try accessing a Google Calendar API endpoint
   - Check server logs for "Using authenticated user:" message

## Debugging Tools

1. **Check Authentication Status**

   ```javascript
   // Frontend
   fetch('/api/auth/status', { credentials: 'include' })
     .then(res => res.json())
     .then(data => console.log('Auth status:', data));
   ```

2. **Test Calendar Access**

   ```javascript
   // Frontend
   fetch('/api/calendar/list', { credentials: 'include' })
     .then(res => res.json())
     .then(data => console.log('Calendars:', data));
   ```

3. **Server Logs**
   - Look for "Tokens stored in session for user:" message
   - Check for "Using authenticated user:" message
   - Monitor for any authentication or token refresh errors

## Environment Variables

These environment variables affect authentication (set in `.env` file):

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - Override the default callback URL
- `SESSION_SECRET` - Secret for signing session cookies
