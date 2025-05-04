# Development Environment Setup

This document provides instructions for setting up and running the development environment for the AKC Revisions project.

## Quick Start

To start the development environment, you need to run **both** the frontend and backend servers:

```bash
# Terminal 1: Start the backend server
cd server
node server.js

# Terminal 2: Start the frontend server
# (from project root)
npm run dev
```

## Step-by-Step Instructions

### 1. Backend Server (Express)

The backend server provides API endpoints and handles Google integration.

```bash
# Navigate to the server directory
cd server

# Start the server
node server.js
```

**Expected output:**

- Server will start on port 3000
- You'll see "Backend server listening on http://localhost:3000"
- Log messages about loaded environment variables

### 2. Frontend Server (Vite + React)

The frontend provides the user interface and connects to the backend API.

```bash
# From the project root
npm run dev
```

**Expected output:**

- Vite will start on port 8080 (or 8081 if 8080 is in use)
- You'll see a URL like "Local: http://localhost:8081/"

## Environment Variables

The backend requires the following environment variables for full functionality:

- `GOOGLE_CLIENT_ID` - Google API client ID
- `GOOGLE_CLIENT_SECRET` - Google API client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URL
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase API key

These can be set in a `.env` file in the server directory.

## Google OAuth Redirect Issue

**Important**: The server logs show a known issue where Google OAuth redirects to `localhost:8080` even though the frontend typically runs on port 8081.

### Fix Options:

1. **Edit server.js**:

   ```javascript
   // Find this line in server/server.js
   const REDIRECT_URI =
     process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8081/auth/google/callback';

   // Also update all instances of redirect in the callback handler to use port 8081
   res.redirect('http://localhost:8081/settings?auth_success=true');
   ```

2. **Use environment variables**:
   Create a `.env` file in the server directory with:

   ```
   GOOGLE_REDIRECT_URI=http://localhost:8081/auth/google/callback
   ```

3. **Force frontend to use port 8080**:
   If you need to keep existing OAuth settings, modify vite.config.ts:
   ```typescript
   server: {
     port: 8080,
     strictPort: true, // Force this exact port
     // ...
   }
   ```

After making any of these changes, restart both servers.

## Common Issues

1. **Port conflicts**: If port 8080 is in use, Vite will automatically use port 8081
2. **Missing environment variables**: The server will show warnings if Google credentials are missing
3. **Authentication failures**: Ensure the correct redirect URIs are set in the Google Cloud Console

## Google Calendar Authentication

The application uses Google OAuth for Calendar integration. Make sure:

1. The Google OAuth credentials are properly configured in Google Cloud Console
2. The redirect URI matches the port Vite is using (e.g., http://localhost:8081/auth/google/callback)
3. The server's REDIRECT_URI constant matches the frontend port
4. The server has credentials for Google OAuth (client ID and secret)
