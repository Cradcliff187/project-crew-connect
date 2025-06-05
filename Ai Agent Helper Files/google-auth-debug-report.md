# Google Calendar Authentication Debug Report

## Summary

This report documents the investigation and resolution of a critical issue where Google Calendar authentication was not persisting after login. Users would complete the Google OAuth flow but return to the application still showing a "Connect" prompt rather than a connected state.

## Root Causes

1. **Session vs In-Memory Storage Conflict**

   - The application was transitioning from an in-memory token store (`tokenStore`) to a session-based approach
   - Remnants of the in-memory approach remained in the code, causing conflicts
   - The server kept defaulting to previously stored credentials even after new logins

2. **Port Mismatch in OAuth Redirect**

   - Hard-coded redirects to port 8080 while frontend typically runs on port 8081
   - Return path after authentication was pointing to the wrong location

3. **Email Reference Issue**
   - The server was referencing the wrong user email (matt@austinkunzconstruction.com) even when other users authenticated
   - This prevented proper token retrieval for current user

## Files Modified

1. **Backend Server (`server/server.js`)**

   - Removed all references to the in-memory `tokenStore` variable
   - Updated all redirect URLs to use port 8081
   - Fixed the `requireAuth` middleware to properly use session data
   - Added explicit user email logging for debugging
   - Added a `/auth/clear` endpoint for testing and resetting session state

2. **Frontend Hook (`src/hooks/useGoogleCalendar.tsx`)**

   - Updated API endpoints to use relative paths (`/api/auth/*`)
   - Added proper credentials and request method for logout function
   - Ensured consistent protocol across all API requests

3. **Vite Configuration (`vite.config.ts`)**

   - Verified proxy configuration to correctly route `/api` and `/auth` paths
   - Added cookie handling configuration for proper session management

4. **Documentation**
   - Updated `README.md` to clearly document the need to run both servers
   - Created `docs/development_setup.md` with comprehensive setup instructions
   - Added details about Google OAuth configuration requirements

## Steps Taken to Resolve

1. **Investigation**

   - Examined authentication flow and identified remnants of in-memory token storage
   - Traced OAuth redirect paths to identify port mismatches
   - Analyzed server logs to find incorrect email references

2. **Implementation**

   - Migrated fully to session-based authentication
   - Updated OAuth configuration to work with dynamic ports
   - Fixed server middleware to use correct user credentials

3. **Validation**
   - Reset auth state using new `/auth/clear` endpoint
   - Completed full OAuth flow with different users
   - Verified token persistence across page reloads

## Technical Details

### Authentication Flow

1. User clicks "Connect to Google Calendar" in Settings
2. Frontend redirects to `/auth/google` which proxies to the backend
3. Backend redirects to Google OAuth consent screen
4. Google redirects back to our callback URL with an auth code
5. Backend exchanges code for tokens and stores them in the session
6. Backend redirects to frontend with `auth_success=true` parameter
7. Frontend detects success parameter and updates UI

### Session Storage

Tokens are now stored in Express sessions with:

```javascript
req.session.tokens = tokens; // OAuth tokens
req.session.userEmail = userEmail; // User identifier
req.session.userInfo = {
  // User profile data
  email: userInfo.data.email,
  name: userInfo.data.name,
  picture: userInfo.data.picture,
};
```

### Port Configuration

- Backend consistently runs on port 3000
- Frontend can run on port 8080 or 8081 (if 8080 is in use)
- OAuth redirect must match the actual frontend port

## Instructions for Future Developers

1. **Running the Application**

   - You must run both servers for the application to function properly:
     - Backend server: `cd server && node server.js`
     - Frontend server: `npm run dev`
   - See `docs/development_setup.md` for detailed instructions

2. **Google OAuth Configuration**

   - If using a different port, update the `REDIRECT_URI` in `server.js`
   - Use the `/auth/clear` endpoint to reset authentication state during testing
   - Monitor server logs for messages containing "Using authenticated user:" to confirm credential usage

3. **Debugging Authentication Issues**
   - Check server logs for proper session creation and token storage
   - Verify port matches in the OAuth redirect configuration
   - For persistent issues, clear browser cookies and session storage

## Conclusion

The Google Calendar authentication issue was successfully resolved by fully migrating to session-based authentication and fixing port mismatches in the OAuth configuration. The application now correctly persists authentication state across page reloads and properly reflects connection status in the UI.
