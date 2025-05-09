# Google Calendar Integration - Production Setup

This document provides a comprehensive guide for deploying the Google Calendar integration to a production environment.

## Requirements for Production

To successfully deploy the Google Calendar integration in production, you'll need:

1. **Google Cloud Project** with Calendar API enabled
2. **OAuth credentials** configured for your production domain
3. **Backend API server** for handling OAuth flows and API calls
4. **Secure token storage** solution for preserving user credentials
5. **Integration with user authentication** to ensure proper access control

## Step 1: Google Cloud Project Setup

### Create and Configure Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API" and enable it

### Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose user type:
   - For internal use, select "Internal" (Google Workspace only)
   - For public applications, select "External"
3. Complete the required information:
   - App name: "Your Company Name - CRM"
   - User support email
   - Developer contact information
4. Add the necessary scopes:
   - `https://www.googleapis.com/auth/calendar` (For full calendar access)
   - `https://www.googleapis.com/auth/userinfo.profile` (For user profile info)
   - `https://www.googleapis.com/auth/userinfo.email` (For user email)
5. Add your domains to the authorized domains list
6. If using External type, verify your domain ownership
7. Click "PUBLISH APP" to make it available to all users

### Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add your production domain to "Authorized JavaScript origins"
   - Example: `https://yourapp.com`
5. Add your callback URL to "Authorized redirect URIs"
   - Example: `https://yourapp.com/api/auth/google/callback`
6. Create and note the Client ID and Client Secret for your environment configuration

## Step 2: Server Configuration

### Environment Variables

Configure these environment variables on your production server:

```bash
# Google API Configuration
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourapp.com/api/auth/google/callback

# Token Encryption (generate a secure random key)
ENCRYPTION_KEY=your-32-character-encryption-key

# API Configuration
API_BASE_URL=https://yourapp.com/api
AUTH_BASE_URL=https://yourapp.com/auth
FRONTEND_URL=https://yourapp.com
```

### Update API Base URL in Frontend

Ensure your frontend code references the production API URL:

```typescript
// src/services/googleCalendarService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

Make sure to set the `VITE_API_BASE_URL` environment variable during your frontend build process:

```bash
VITE_API_BASE_URL=https://yourapp.com/api
```

## Step 3: Implement Secure Token Storage

Replace the in-memory token storage with a secure, persistent solution:

### Database Storage Solution

Create a database table to store encrypted tokens:

```sql
CREATE TABLE oauth_tokens (
  user_id TEXT PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Implement token encryption before storage:

```javascript
// server/auth/tokenStorage.js
const crypto = require('crypto');
const { db } = require('../database');

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes for AES-256
const IV_LENGTH = 16;

// Encrypt data before storing
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

// Decrypt data when retrieving
function decrypt(text) {
  const [iv, authTag, encryptedText] = text.split(':').map(part => Buffer.from(part, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
}

// Store tokens for a user
async function storeTokens(userId, tokens) {
  const encryptedTokens = encrypt(JSON.stringify(tokens));

  return db.query(
    `INSERT INTO oauth_tokens (user_id, access_token, refresh_token, expiry_date)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE
     SET access_token = $2, refresh_token = $3, expiry_date = $4, updated_at = CURRENT_TIMESTAMP`,
    [userId, encryptedTokens, tokens.refresh_token, new Date(tokens.expiry_date)]
  );
}

// Retrieve tokens for a user
async function getTokens(userId) {
  const result = await db.query('SELECT access_token FROM oauth_tokens WHERE user_id = $1', [
    userId,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const encryptedTokens = result.rows[0].access_token;
  return JSON.parse(decrypt(encryptedTokens));
}

// Delete tokens for a user
async function deleteTokens(userId) {
  return db.query('DELETE FROM oauth_tokens WHERE user_id = $1', [userId]);
}

module.exports = {
  storeTokens,
  getTokens,
  deleteTokens,
};
```

## Step 4: Integrate with User Authentication

Ensure the Google Calendar integration works with your application's authentication system:

```javascript
// server/middleware/authMiddleware.js
const { getTokens } = require('../auth/tokenStorage');
const { google } = require('googleapis');

// Middleware to ensure user is authenticated and has Google Calendar access
async function requireGoogleAuth(req, res, next) {
  // First check if the user is authenticated in your application
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Then check if they have Google Calendar tokens
  try {
    const tokens = await getTokens(req.user.id);

    if (!tokens) {
      return res.status(403).json({
        error: 'Google Calendar not connected',
        needsConnection: true,
      });
    }

    // Create OAuth client with tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials(tokens);

    // Check if token is expired and needs refresh
    if (Date.now() > tokens.expiry_date) {
      // Token will be refreshed automatically when making Google API calls
      // But we can explicitly refresh it here if needed
      const { tokens: newTokens } = await oauth2Client.refreshToken(tokens.refresh_token);
      await storeTokens(req.user.id, newTokens);
      oauth2Client.setCredentials(newTokens);
    }

    // Add the oauth client to the request object for use in route handlers
    req.oauth2Client = oauth2Client;

    // Continue to the route handler
    next();
  } catch (error) {
    console.error('Google auth middleware error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google Calendar' });
  }
}

module.exports = { requireGoogleAuth };
```

Use this middleware in your calendar API routes:

```javascript
// server/routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const { requireGoogleAuth } = require('../middleware/authMiddleware');
const { google } = require('googleapis');

// Apply middleware to all calendar routes
router.use(requireGoogleAuth);

// Get events endpoint
router.get('/events', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: req.oauth2Client });

    // Extract query parameters with defaults
    const { timeMin, timeMax, calendarId = 'primary' } = req.query;

    // Make the API request to Google
    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Return the events to the client
    res.json({ events: response.data.items });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events from Google Calendar' });
  }
});

// Additional endpoints...

module.exports = router;
```

## Step 5: Implement Token Refresh and Error Handling

Ensure your backend properly handles token refresh and API errors:

```javascript
// server/utils/googleApiHelper.js
const { storeTokens } = require('../auth/tokenStorage');

// Helper function to make Google API calls with automatic token refresh
async function callGoogleApi(oauth2Client, userId, apiCall) {
  try {
    // Attempt the API call
    return await apiCall();
  } catch (error) {
    // Check if the error is due to an invalid/expired token
    if (error.code === 401 || (error.response && error.response.status === 401)) {
      try {
        // Refresh the token
        const { tokens: newTokens } = await oauth2Client.refreshToken(
          oauth2Client.credentials.refresh_token
        );

        // Update the credentials and store the new tokens
        oauth2Client.setCredentials(newTokens);
        await storeTokens(userId, newTokens);

        // Retry the API call with the new token
        return await apiCall();
      } catch (refreshError) {
        // If refresh fails, user needs to reauthenticate
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication expired. Please reconnect your Google Calendar account.');
      }
    }

    // For other errors, just re-throw
    throw error;
  }
}

module.exports = { callGoogleApi };
```

## Step 6: Frontend Updates

Ensure your frontend code gracefully handles production-specific scenarios:

```typescript
// src/hooks/useGoogleCalendar.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { googleCalendarService } from '@/services/googleCalendarService';

export function useGoogleCalendar() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authorization status
  const checkAuth = useCallback(async () => {
    if (!user) {
      setIsAuthorized(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const authorized = await googleCalendarService.isAuthorized();
      setIsAuthorized(authorized);
    } catch (err) {
      console.error('Failed to check Google Calendar auth:', err);
      setError('Failed to check authorization status');
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initiate authorization flow
  const authorize = useCallback(() => {
    // In production, redirect to the auth endpoint
    window.location.href = `${import.meta.env.VITE_AUTH_BASE_URL || '/auth'}/google`;
  }, []);

  // Handle disconnecting from Google Calendar
  const disconnect = useCallback(async () => {
    try {
      setIsLoading(true);

      // Call the logout endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      setIsAuthorized(false);
    } catch (err) {
      console.error('Failed to disconnect from Google Calendar:', err);
      setError('Failed to disconnect');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status on component mount or user change
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isLoading,
    isAuthorized,
    error,
    authorize,
    disconnect,
    checkAuth,
  };
}
```

## Step 7: Testing in Production

Before fully deploying:

1. **Test with development users first:**

   - Keep your OAuth app in "Testing" mode
   - Add specific users as test users in the OAuth consent screen

2. **Validate all endpoints:**

   - Authentication flow
   - Event creation
   - Event updates
   - Event deletion
   - Listing events

3. **Verify token refresh:**

   - Test the application over an extended period
   - Validate that expired tokens are refreshed correctly

4. **Test error recovery:**
   - Simulate API errors to validate error handling
   - Check that users are properly redirected to reauthenticate when needed

## Step 8: Monitoring and Maintenance

Implement proper monitoring for your production integration:

1. **Set up logging:**

   - Log authentication events
   - Track API response times
   - Monitor error rates

2. **Create alerts:**

   - Alert on high error rates
   - Alert on authentication failures
   - Monitor for unusual API usage patterns

3. **Regular maintenance:**
   - Check for deprecated API features
   - Test the integration periodically
   - Update dependencies and OAuth configuration as needed

## Security Best Practices

1. **Never store tokens on the client:**

   - All tokens should be managed server-side
   - Use secure HTTP-only cookies for session management

2. **Implement proper authorization:**

   - Only allow users to access their own calendar data
   - Verify entity ownership before performing calendar operations

3. **Use HTTPS everywhere:**

   - All API endpoints must use HTTPS
   - All OAuth redirects must use HTTPS

4. **Implement rate limiting:**

   - Prevent abuse of your calendar endpoints
   - Protect against brute force attacks

5. **Regular security audits:**
   - Periodically review your OAuth configuration
   - Audit token storage and encryption mechanisms
   - Check for any leaked credentials or tokens

## Related Documentation

- [Google Calendar Integration - Overview](./google-calendar-integration.md)
- [Google Calendar Integration - Development Mode](./google-calendar-development.md)
- [Google Calendar Authentication Guide](../google-calendar-auth.md)
- [Shared Google Calendar Integration](./shared-calendar-usage.md)
