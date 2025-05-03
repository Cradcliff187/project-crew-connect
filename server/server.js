// server/server.js
// Task 2: OAuth 2.0 Authentication Flow - Initial Setup

// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('@googlemaps/google-maps-services-js');

// --- Helper Modules ---
const driveHelper = require('./google-api-helpers/drive');
const calendarHelper = require('./google-api-helpers/calendar');
const gmailHelper = require('./google-api-helpers/gmail');
const sheetsHelper = require('./google-api-helpers/sheets'); // Import for potential future use
const docsHelper = require('./google-api-helpers/docs'); // Import for potential future use
// TODO: Import other helpers (Sheets, Docs)

// Load environment variables from .env file
dotenv.config();

// --- DEBUGGING: Log loaded environment variables ---
console.log('DEBUG: Loaded Env Vars:');
console.log(`  GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'MISSING'}`);
console.log(`  GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'MISSING'}`);
console.log(`  GOOGLE_REDIRECT_URI: ${process.env.GOOGLE_REDIRECT_URI ? 'Loaded' : 'MISSING'}`);
console.log(`  GOOGLE_MAPS_API_KEY: ${process.env.GOOGLE_MAPS_API_KEY ? 'Loaded' : 'MISSING'}`);
console.log('----------------------------------------');
// --- End Debugging ---

// --- Configuration ---
const PORT = process.env.SERVER_PORT || 8080; // Default to 8080 if not specified
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// --- Basic Server Setup ---
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies

// --- Google OAuth2 Client Initialization ---
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// --- Simple In-Memory Token Store (Replace with a persistent store later) ---
let tokenStore = {}; // Store tokens keyed by a user identifier (e.g., session ID or user ID)

// --- Routes ---
app.get('/', (req, res) => {
  res.send('CRM Live Google Integration Server is running!');
});

// Task 2: Implement /auth/google route
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.modify', // Use .modify for read/write/send
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/userinfo.profile', // To get basic user info
  'https://www.googleapis.com/auth/userinfo.email', // To get user email
];

app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: GOOGLE_SCOPES,
    prompt: 'consent', // Force consent screen even if previously approved
  });
  console.log('Redirecting to Google Auth URL:', authUrl);
  res.redirect(authUrl);
});

// Task 2: Implement /auth/google/callback route
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Authorization code missing.');
  }

  try {
    console.log('Received authorization code:', code);
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Received tokens:', tokens);

    // IMPORTANT: Store these tokens securely!
    // For now, store in memory (keyed by user email for simplicity, replace later)
    // You'll need a way to identify the user across requests (e.g., session, JWT)
    oauth2Client.setCredentials(tokens);

    // Fetch user profile to get email as a simple key for the token store
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;

    if (userEmail) {
      tokenStore[userEmail] = tokens; // Store tokens associated with the user
      console.log(`Tokens stored for user: ${userEmail}`);
      // In a real app, you would likely set a session cookie or JWT here
      // containing the userEmail or another identifier.
      res.send('Authentication successful! You can close this tab.'); // Simple success message
    } else {
      console.error('Could not retrieve user email.');
      res.status(500).send('Authentication failed: Could not identify user.');
    }
  } catch (error) {
    console.error(
      'Error exchanging authorization code for tokens:',
      error.response ? error.response.data : error.message
    );
    res.status(500).send('Authentication failed.');
  }
});

// Task 2: Implement middleware for authenticated routes
const requireAuth = async (req, res, next) => {
  // In a real app, get user identifier (e.g., email) from session/JWT
  // For this example, we'll assume it's passed in a header or query param
  // THIS IS NOT SECURE FOR PRODUCTION - REPLACE WITH PROPER SESSION/JWT MANAGEMENT
  const userEmail = req.query.userEmail || req.headers['x-user-email'];

  if (!userEmail) {
    return res.status(401).send('Authentication required: User identifier missing.');
  }

  const tokens = tokenStore[userEmail];
  if (!tokens) {
    return res
      .status(401)
      .send(
        'Authentication required: No tokens found for user. Please login again via /auth/google.'
      );
  }

  // Create a new OAuth2 client instance for this user request
  // This prevents race conditions if multiple users are active
  const userClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  userClient.setCredentials(tokens);

  try {
    // Check if the access token is expired and refresh if necessary
    // googleapis library automatically handles refresh if refresh_token is present
    // and expiry_date is set or token is expired.
    // We can force a check/refresh attempt by trying to get the access token.
    await userClient.getAccessToken();

    // Check if the token was refreshed and update the store
    if (userClient.credentials.access_token !== tokens.access_token) {
      console.log(`Access token refreshed for user: ${userEmail}`);
      tokenStore[userEmail] = userClient.credentials; // Update store with new tokens (including potentially new access token)
    }

    // Attach the authenticated client and user email to the request object
    req.googleClient = userClient;
    req.userEmail = userEmail;
    next(); // Proceed to the protected route
  } catch (error) {
    console.error(
      'Authentication error or token refresh failed:',
      error.response ? error.response.data : error.message
    );
    // Optionally, clear invalid tokens from the store
    delete tokenStore[userEmail];
    return res
      .status(401)
      .send('Authentication failed or token expired. Please login again via /auth/google.');
  }
};

// Task 2: Implement Logout
app.get('/auth/logout', (req, res) => {
  // Again, needs proper user identification via session/JWT
  const userEmail = req.query.userEmail || req.headers['x-user-email'];

  if (userEmail && tokenStore[userEmail]) {
    delete tokenStore[userEmail];
    console.log(`Tokens deleted for user: ${userEmail}`);
    res.send('Logout successful.');
  } else {
    res.status(400).send('User not identified or not logged in.');
  }
});

// --- Task 3: API Client Setup ---

// Placeholder for API helper modules (to be potentially refactored later)

// --- Task 5: Testing & Validation ---

// Example Test Route for Google Drive (Requires Authentication)
app.get('/test/drive', requireAuth, async (req, res) => {
  // Use the Drive helper module
  try {
    console.log(`Testing Drive API via helper for user: ${req.userEmail}`);
    const options = {
      pageSize: 5,
      orderBy: 'modifiedTime desc',
    };
    const data = await driveHelper.listFiles(req.googleClient, options);
    console.log('Drive API Response (via helper):', data);
    res.json({
      message: 'Successfully accessed Google Drive API via helper.',
      user: req.userEmail,
      files: data.files,
    });
  } catch (error) {
    console.error(
      'Error accessing Google Drive API via helper:',
      error.response ? error.response.data : error.message
    );
    // The helper doesn't throw errors with response status directly, so we check the error structure
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).send(`Failed to access Google Drive API via helper: ${message}`);
  }
});

// Test Route for Google Calendar
app.get('/test/calendar', requireAuth, async (req, res) => {
  // Use the Calendar helper module
  try {
    console.log(`Testing Calendar API via helper for user: ${req.userEmail}`);
    const options = {
      maxResults: 5,
      // timeMin is defaulted to now() in the helper
    };
    const data = await calendarHelper.listEvents(req.googleClient, options);
    console.log('Calendar API Response (via helper):', data);
    res.json({
      message: 'Successfully accessed Google Calendar API via helper.',
      user: req.userEmail,
      events: data.items,
    });
  } catch (error) {
    console.error(
      'Error accessing Google Calendar API via helper:',
      error.response ? error.response.data : error.message
    );
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).send(`Failed to access Google Calendar API via helper: ${message}`);
  }
});

// Test Route for Google Gmail
app.get('/test/gmail', requireAuth, async (req, res) => {
  // Use the Gmail helper module
  try {
    console.log(`Testing Gmail API via helper for user: ${req.userEmail}`);
    const options = { maxResults: 5, q: 'is:unread' };
    const data = await gmailHelper.listMessages(req.googleClient, options);
    console.log('Gmail API Response (via helper):', data);
    res.json({
      message: 'Successfully accessed Google Gmail API via helper.',
      user: req.userEmail,
      result: data,
    });
  } catch (error) {
    console.error(
      'Error accessing Google Gmail API via helper:',
      error.response ? error.response.data : error.message
    );
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).send(`Failed to access Google Gmail API via helper: ${message}`);
  }
});

// Test Route for Google Sheets
app.get('/test/sheets', requireAuth, async (req, res) => {
  // Listing sheets is done via Drive API helper
  try {
    console.log(`Testing Sheets API (listing via Drive helper) for user: ${req.userEmail}`);
    const options = {
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      pageSize: 5,
      fields: 'files(id, name)', // Keep fields minimal for listing
      orderBy: 'modifiedTime desc',
    };
    // Use driveHelper to list spreadsheet files
    const data = await driveHelper.listFiles(req.googleClient, options);
    console.log('Sheets list (via Drive helper) Response:', data);
    res.json({
      message: 'Successfully listed Google Sheets files via Drive helper.',
      user: req.userEmail,
      spreadsheets: data.files,
    });
  } catch (error) {
    console.error(
      'Error listing Google Sheets via Drive helper:',
      error.response ? error.response.data : error.message
    );
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).send(`Failed to list Google Sheets files: ${message}`);
  }
});

// Test Route for Google Docs
app.get('/test/docs', requireAuth, async (req, res) => {
  // Listing docs is done via Drive API helper
  try {
    console.log(`Testing Docs API (listing via Drive helper) for user: ${req.userEmail}`);
    const options = {
      q: "mimeType='application/vnd.google-apps.document'",
      pageSize: 5,
      fields: 'files(id, name)', // Keep fields minimal for listing
      orderBy: 'modifiedTime desc',
    };
    // Use driveHelper to list document files
    const data = await driveHelper.listFiles(req.googleClient, options);
    console.log('Docs list (via Drive helper) Response:', data);
    res.json({
      message: 'Successfully listed Google Docs files via Drive helper.',
      user: req.userEmail,
      documents: data.files,
    });
  } catch (error) {
    console.error(
      'Error listing Google Docs via Drive helper:',
      error.response ? error.response.data : error.message
    );
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).send(`Failed to list Google Docs files: ${message}`);
  }
});

// --- Task 4: Google Maps Integration ---
const mapsClient = new Client({});
const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.get('/api/maps/autocomplete', async (req, res) => {
  const input = req.query.input;
  if (!input) {
    return res.status(400).send('Missing required query parameter: input');
  }
  if (!MAPS_API_KEY) {
    console.error('Google Maps API Key is missing in .env');
    return res.status(500).send('Server configuration error: Maps API key missing.');
  }

  try {
    console.log(`Maps Autocomplete request for input: "${input}"`);
    const response = await mapsClient.placeAutocomplete({
      params: {
        input: input,
        key: MAPS_API_KEY,
        // Optional: Add component restrictions (e.g., country: 'us') if needed
        // components: 'country:us',
      },
      timeout: 1000, // milliseconds
    });

    if (response.data.status === 'OK') {
      res.json(response.data.predictions);
    } else {
      console.error(
        'Maps Autocomplete API Error:',
        response.data.status,
        response.data.error_message
      );
      res.status(500).json({
        message: `Maps Autocomplete API Error: ${response.data.status}`,
        error: response.data.error_message || 'Unknown error',
      });
    }
  } catch (error) {
    // Log the detailed error on the server
    console.error(
      'Error calling Maps Autocomplete API:',
      error.response ? error.response.data : error.message
    );
    // Send a JSON response to the client
    res.status(500).json({
      message: 'Failed to fetch place predictions.',
      error: error.message, // Include error message if available
    });
  }
});

// Endpoint to get Place Details using place_id
app.get('/api/maps/placedetails', async (req, res) => {
  const placeid = req.query.placeid;
  if (!placeid) {
    return res.status(400).send('Missing required query parameter: placeid');
  }
  if (!MAPS_API_KEY) {
    console.error('Google Maps API Key is missing in .env');
    return res.status(500).send('Server configuration error: Maps API key missing.');
  }

  try {
    console.log(`Maps Place Details request for placeid: "${placeid}"`);
    const response = await mapsClient.placeDetails({
      params: {
        place_id: placeid,
        key: MAPS_API_KEY,
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'], // Specify desired fields
      },
      timeout: 1000, // milliseconds
    });

    if (response.data.status === 'OK') {
      res.json(response.data.result);
    } else {
      console.error(
        'Maps Place Details API Error:',
        response.data.status,
        response.data.error_message
      );
      res.status(500).json({
        message: `Maps Place Details API Error: ${response.data.status}`,
        error: response.data.error_message || 'Unknown error',
      });
    }
  } catch (error) {
    // Log the detailed error on the server
    console.error(
      'Error calling Maps Place Details API:',
      error.response ? error.response.data : error.message
    );
    // Send a JSON response to the client
    res.status(500).json({
      message: 'Failed to fetch place details.',
      error: error.message, // Include error message if available
    });
  }
});

// TODO: Identify address fields and document Autocomplete mapping (Task 4)

// --- Start Server ---
// Use port 3000 for the backend API server
app.listen(3000, () => {
  console.log(`Backend server listening on http://localhost:3000`); // Updated log message
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('!!! WARNING: One or more Google API credentials are missing in .env file.');
  }
});

// module.exports = { app, oauth2Client, tokenStore }; // Comment out or remove exports if not needed for testing framework
