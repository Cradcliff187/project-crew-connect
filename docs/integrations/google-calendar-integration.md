# Google Calendar Integration Documentation

This document provides details on the Google Calendar integration implemented in the CRM Live application.

## Purpose

This integration enables users to sync project milestones, work orders, meetings, time entries, and other important events with their Google Calendar. When enabled, users can maintain a unified view of their construction management activities alongside their personal and work calendars, ensuring nothing falls through the cracks.

## Implementation Details

### Database Schema

The integration is supported by database tables and fields that track calendar events:

- **Primary Table:** `calendar_events`

  - Maps entities in our application to events in Google Calendar
  - Contains fields for tracking entity type, entity ID, Google Calendar event ID, and sync status

- **Settings Table:** `user_settings`

  - Stores user preferences for calendar integration
  - Contains a JSONB field with calendar settings including default reminders, preferred calendar ID, and sync preferences

- **Extended Tables:**
  - `project_milestones` - Added `calendar_sync_enabled` and `calendar_event_id` fields
  - `maintenance_work_orders` - Added `calendar_sync_enabled` and `calendar_event_id` fields
  - `contact_interactions` - Added `calendar_sync_enabled` and `calendar_event_id` fields
  - `time_entries` - Added `calendar_sync_enabled` and `calendar_event_id` fields

### Authentication and API Server

The integration utilizes a dedicated Express server (located in `server/server.js`) to handle:

- Google OAuth authentication flow
- Token storage and refresh
- Google API calls (Calendar, Drive, etc.)
- Secure communication between the frontend and Google APIs

### Reusable Hook

The authentication and user interaction logic is encapsulated in a React hook:

- **Hook:** `useGoogleCalendar`
- **Location:** `src/hooks/useGoogleCalendar.tsx`

This hook handles:

- Checking authentication status
- Initiating OAuth authentication flow with redirect
- Managing user logout
- Fetching and displaying user profile information
- Listing available calendars
- Tracking authentication state for UI components

### Service Layer

Calendar operations are abstracted through a service layer:

- **Service:** `calendarService`
- **Location:** `src/services/calendarService.ts`

This service provides functions for:

- Fetching calendar events
- Creating events for project milestones
- Creating events for work orders
- Creating events for contact meetings
- Creating events for time entries
- Updating existing calendar events
- Deleting calendar events

Additionally, a `userSettings` service manages user preferences:

- **Service:** `userSettings`
- **Location:** `src/services/userSettings.ts`

This service provides functions for:

- Fetching user settings
- Updating settings
- Getting specific setting values with defaults

### Backend API and Helper Module

The integration relies on server-side components:

1. **Helper Module:** `server/google-api-helpers/calendar.js`

   - Provides functions for interacting with the Google Calendar API
   - Handles creating, reading, updating, and deleting calendar events
   - Manages API request formatting and response parsing

2. **API Endpoints:** Defined in `server/server.js`
   - Authentication endpoints:
     - `GET /auth/google` - Initiates OAuth flow
     - `GET /auth/google/callback` - Handles OAuth callback
     - `GET /api/auth/status` - Checks authentication status and returns user profile
     - `POST /api/auth/logout` - Logs user out
   - Calendar endpoints:
     - `GET /api/calendar/events` - Lists user's calendar events
     - `GET /api/calendar/list` - Lists available calendars
     - `POST /api/calendar/milestones/:milestoneId` - Creates calendar event for milestone
     - `POST /api/calendar/workorders/:workOrderId` - Creates calendar event for work order
     - `POST /api/calendar/contacts/meetings/:interactionId` - Creates calendar event for contact meeting
     - `POST /api/calendar/timeentries/:timeEntryId` - Creates calendar event for time entry
     - `PUT /api/calendar/events/:eventId` - Updates existing calendar event
     - `DELETE /api/calendar/events/:eventId` - Deletes calendar event

## Current Setup (Development)

The current implementation uses the following configuration:

1. **Backend Express Server:**

   - Running on `http://localhost:3000`
   - Handles OAuth flow and Google API interactions
   - Stores tokens in memory (not persistent)

2. **Frontend Application:**

   - Running on `http://localhost:8080`
   - Communicates with the backend server for Google operations

3. **Google Cloud Project:**

   - Project ID: `crm-live-458710`
   - OAuth Client ID: `1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com`
   - Configured with redirect URI: `http://localhost:3000/auth/google/callback`

4. **Authentication Flow:**
   - User clicks "Connect Google Calendar" in Settings
   - Browser redirects to Google OAuth consent screen
   - After authentication, Google redirects to our callback endpoint
   - Server stores tokens and redirects back to frontend with success parameter
   - Frontend detects success parameter and updates UI status

## Production Deployment Instructions

To deploy this integration to a production environment, follow these steps:

### 1. Create and Configure Google Cloud Project

1. **Create or Use an Existing Google Cloud Project:**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Note the Project ID for later use

2. **Enable Required APIs:**

   - Navigate to "APIs & Services" > "Library"
   - Enable the following APIs:
     - Google Calendar API
     - Google Drive API (if using Drive features)
     - Gmail API (if using email features)

3. **Configure OAuth Consent Screen:**

   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless your organization uses Google Workspace)
   - Fill in required application information (name, support email, etc.)
   - Add authorized domains matching your production domain
   - Add necessary scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
     - Add additional scopes as needed for other Google services
   - Add any test users if still in testing
   - Publish the app when ready for production

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" type
   - Add your production domain to "Authorized JavaScript origins" (e.g., `https://your-domain.com`)
   - Add your callback URL to "Authorized redirect URIs" (e.g., `https://your-domain.com/api/auth/google/callback`)
   - Save and note the Client ID and Client Secret

### 2. Update Environment Variables

1. **Create Production `.env` File:**

   ```
   # Google API Configuration
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_CLIENT_SECRET=your-production-client-secret
   GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback

   # Google Maps API Configuration (if used)
   GOOGLE_MAPS_API_KEY=your-maps-api-key

   # Other environment variables
   # ...
   ```

2. **Configure Server Port:**
   - If deploying behind a reverse proxy (recommended), use:
     ```
     SERVER_PORT=3000
     ```
   - Ensure your proxy forwards traffic appropriately

### 3. Update Frontend Code

1. **Update API URLs in Frontend Services:**

   In production, you need to update all API URLs to point to your production server:

   **Create a Production-Specific Config:**

   ```typescript
   // src/config.ts
   export const API_BASE_URL =
     process.env.NODE_ENV === 'production'
       ? 'https://your-domain.com/api'
       : 'http://localhost:3000/api';

   export const AUTH_BASE_URL =
     process.env.NODE_ENV === 'production'
       ? 'https://your-domain.com/auth'
       : 'http://localhost:3000/auth';
   ```

2. **Update Service URLs:**

   Update all API calls in the following files to use the config:

   - `src/hooks/useGoogleCalendar.tsx`
   - `src/services/calendarService.ts`

3. **Update Redirect URLs:**

   In `server/server.js`, update the redirect URLs:

   ```javascript
   const FRONTEND_URL =
     process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:8080';

   // Then use FRONTEND_URL in all redirects:
   res.redirect(`${FRONTEND_URL}/settings?auth_success=true`);
   ```

### 4. Implement Secure Token Storage

For production, replace the in-memory token storage with a more secure solution:

1. **Option 1: Database Storage (Recommended):**

   ```javascript
   // In server/server.js
   const storeTokens = async (userEmail, tokens) => {
     try {
       await db.tokens.upsert({
         where: { userEmail },
         update: { tokens: encrypt(JSON.stringify(tokens)) },
         create: { userEmail, tokens: encrypt(JSON.stringify(tokens)) },
       });
     } catch (error) {
       console.error('Failed to store tokens:', error);
     }
   };

   const getTokens = async userEmail => {
     try {
       const record = await db.tokens.findUnique({ where: { userEmail } });
       if (!record) return null;
       return JSON.parse(decrypt(record.tokens));
     } catch (error) {
       console.error('Failed to retrieve tokens:', error);
       return null;
     }
   };
   ```

2. **Option 2: Redis Storage (for High-Traffic Applications):**

   ```javascript
   const redis = require('redis');
   const client = redis.createClient({
     url: process.env.REDIS_URL,
   });

   const storeTokens = async (userEmail, tokens) => {
     await client.set(`tokens:${userEmail}`, encrypt(JSON.stringify(tokens)));
     // Set expiration if needed
     await client.expire(`tokens:${userEmail}`, 60 * 60 * 24 * 30); // 30 days
   };

   const getTokens = async userEmail => {
     const data = await client.get(`tokens:${userEmail}`);
     if (!data) return null;
     return JSON.parse(decrypt(data));
   };
   ```

3. **Implement Proper Encryption**:

   ```javascript
   const crypto = require('crypto');

   const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes for aes-256-gcm
   const IV_LENGTH = 16;

   function encrypt(text) {
     const iv = crypto.randomBytes(IV_LENGTH);
     const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
     const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
     const authTag = cipher.getAuthTag();
     return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted.toString('hex');
   }

   function decrypt(text) {
     const parts = text.split(':');
     const iv = Buffer.from(parts[0], 'hex');
     const authTag = Buffer.from(parts[1], 'hex');
     const encryptedText = Buffer.from(parts[2], 'hex');
     const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
     decipher.setAuthTag(authTag);
     return decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
   }
   ```

### 5. Implement User Authentication

In production, integrate the Google Calendar authentication with your application's existing user authentication:

1. **Associate Google Tokens with User Accounts:**

   - Store tokens linked to your application's user IDs
   - Validate that the authenticated user has permission to access the requested data

2. **Update the Authentication Middleware:**

   ```javascript
   const requireAuth = async (req, res, next) => {
     // Get the authenticated user from your app's auth system
     const userId = req.user?.id; // Assuming your auth middleware sets req.user

     if (!userId) {
       return res.status(401).send('Authentication required');
     }

     // Get Google tokens for this user
     const tokens = await getTokensForUser(userId);

     if (!tokens) {
       return res.status(401).send('Google Calendar not connected. Please connect your account.');
     }

     // Create OAuth client with user's tokens
     const userClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
     userClient.setCredentials(tokens);

     // Rest of the middleware remains similar...
   };
   ```

### 6. Deploy the Backend Server

1. **Standalone Deployment:**

   - Set up a Node.js server environment (e.g., AWS EC2, DigitalOcean, Heroku)
   - Configure proper environment variables
   - Use a process manager like PM2 to keep the server running

   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "google-api-server"
   ```

2. **Serverless Deployment:**
   - Refactor the server code for serverless functions (e.g., AWS Lambda, Google Cloud Functions)
   - Create separate functions for each API endpoint
   - Store tokens in a database or secure storage
   - Example for AWS Lambda with Serverless Framework:
     ```yaml
     # serverless.yml
     functions:
       auth:
         handler: src/auth.handler
         events:
           - http:
               path: /auth/google
               method: get
       authCallback:
         handler: src/authCallback.handler
         events:
           - http:
               path: /auth/google/callback
               method: get
       # Additional functions for other endpoints
     ```

### 7. Set Up Reverse Proxy (Optional but Recommended)

Use Nginx or another reverse proxy to handle HTTPS and route requests:

```nginx
# Example Nginx configuration
server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL configuration
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Auth endpoints
    location /auth/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Security Considerations

In production, implement these additional security measures:

1. **OAuth Security:**

   - Verify the `state` parameter in OAuth flow to prevent CSRF attacks
   - Use PKCE (Proof Key for Code Exchange) for added security
   - Implement rate limiting on auth endpoints

2. **Token Security:**

   - Never store tokens in client-side JavaScript or cookies
   - Always encrypt tokens before storing them
   - Use proper key management for encryption keys
   - Implement token rotation for long-lived sessions

3. **API Security:**

   - Validate all input parameters from users
   - Implement proper authorization checks for all API endpoints
   - Use HTTPS for all communications
   - Add API rate limiting to prevent abuse

4. **Monitoring and Alerting:**
   - Set up logging for authentication events
   - Monitor for unusual API usage patterns
   - Create alerts for authentication failures

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**

   - Verify the correct redirect URI is configured in Google Cloud Console
   - Check that the environment variables are properly set
   - Look for CORS issues if using separate domains for frontend and API

2. **Calendar Access Issues**

   - Ensure the user has granted the appropriate scopes during authentication
   - Check that the user's access token is valid and not expired
   - Verify the calendar ID being used exists and is accessible to the user

3. **Token Refresh Problems**
   - Ensure the refresh token is being stored securely
   - Implement proper error handling for token refresh failures
   - Add retry logic with exponential backoff

## Implemented Components

The Google Calendar integration has been added to the following components:

### Project Milestones

- **Component:** `src/components/projects/milestones/MilestoneFormDialog.tsx`

  - Added a toggle to enable/disable calendar sync
  - Shows warning if due date is missing but sync is enabled

- **Component:** `src/components/projects/milestones/ProjectMilestones.tsx`
  - Implements calendar event creation when milestone is created
  - Handles updating events when milestones are modified
  - Removes events when sync is disabled or milestone is deleted

### Work Orders

- **Component:** `src/components/workOrders/dialog/WorkOrderScheduleFields.tsx`
  - Added calendar sync toggle in schedule section
  - Disables toggle when scheduled date is missing
  - Shows warning when sync is enabled but date is missing

### Contact Interactions

- **Component:** `src/components/contacts/detail/InteractionsSection.tsx`
  - Added calendar sync toggle for meetings and tasks
  - Implemented attendee management for calendar invites
  - Added "Add to Calendar" button for existing meetings not yet in calendar
  - Shows calendar sync status on interactions

### Time Tracking

- **Component:** `src/components/timeTracking/TimeEntryForm.tsx`

  - Added calendar sync toggle
  - Integrates time entries with calendar blocks
  - Handles work date, start/end times in calendar events

- **Hook:** `src/hooks/useTimeEntrySubmit.ts`
  - Implements calendar event creation during time entry submission
  - Handles error cases gracefully

### Settings Component

- **Component:** `src/components/common/GoogleCalendarSettings.tsx`
  - Provides interface for connecting/disconnecting Google Calendar
  - Shows connected account information with profile picture
  - Allows selection of default calendar
  - Manages default reminders with add/remove functionality
  - Offers granular sync preferences for different entity types
  - Controls notification settings for events
