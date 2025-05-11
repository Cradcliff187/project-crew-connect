// server/server.js
// Task 2: OAuth 2.0 Authentication Flow - Initial Setup

// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('@googlemaps/google-maps-services-js');
const { createClient } = require('@supabase/supabase-js');
const session = require('express-session');

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://dxmvqbeyhfnqczvlfnfn.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

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

// Constants
const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  '1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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';
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback';

// --- Basic Server Setup ---
const app = express();

// Configure CORS for cross-origin requests
app.use(
  cors({
    origin: 'http://localhost:8080', // Frontend is running on port 8080
    credentials: true, // Allow credentials (cookies)
  })
);

// Parse JSON bodies
app.use(express.json());

// Configure session for token storage
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'akc-calendar-integration-secret',
    resave: false,
    saveUninitialized: true, // Changed to true to ensure session is created
    cookie: {
      secure: false, // Set to false for development on HTTP
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
    },
  })
);

// --- Google OAuth2 Client Initialization ---
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

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

    // Store tokens in the session instead of in-memory store
    oauth2Client.setCredentials(tokens);

    // Fetch user profile to get email
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;

    if (userEmail) {
      // Store tokens and user info in session
      req.session.tokens = tokens;
      req.session.userEmail = userEmail;
      req.session.userInfo = {
        email: userInfo.data.email,
        name: userInfo.data.name,
        picture: userInfo.data.picture,
      };
      console.log(`Tokens stored in session for user: ${userEmail}`);

      // Redirect to the frontend application with auth_success parameter
      res.redirect('http://localhost:8080/settings?auth_success=true');
    } else {
      console.error('Could not retrieve user email.');
      res.redirect('http://localhost:8080/settings?auth_error=true');
    }
  } catch (error) {
    console.error(
      'Error exchanging authorization code for tokens:',
      error.response ? error.response.data : error.message
    );
    res.redirect('http://localhost:8080/settings?auth_error=true');
  }
});

// New endpoint: Auth status check
app.get('/api/auth/status', async (req, res) => {
  // Check if user is authenticated via session
  if (!req.session.tokens || !req.session.userEmail) {
    return res.status(200).json({ authenticated: false });
  }

  const tokens = req.session.tokens;
  const userEmail = req.session.userEmail;

  // Verify tokens by creating a client
  const userClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  userClient.setCredentials(tokens);

  // Check if tokens have expired
  const tokenExpiry = tokens.expiry_date;
  const isExpired = tokenExpiry ? Date.now() >= tokenExpiry : false;

  if (isExpired && !tokens.refresh_token) {
    // Cannot refresh, token is expired
    delete req.session.tokens;
    delete req.session.userEmail;
    delete req.session.userInfo;
    return res.status(200).json({ authenticated: false });
  }

  try {
    // Get user information from Google
    const oauth2 = google.oauth2({
      auth: userClient,
      version: 'v2',
    });

    const userInfoResponse = await oauth2.userinfo.get();
    const userInfo = {
      email: userInfoResponse.data.email,
      name: userInfoResponse.data.name,
      picture: userInfoResponse.data.picture,
    };

    // Update session with fresh user info
    req.session.userInfo = userInfo;

    // If tokens were refreshed, update the session
    if (userClient.credentials.access_token !== tokens.access_token) {
      console.log(`Access token refreshed for user: ${userEmail}`);
      req.session.tokens = userClient.credentials;
    }

    // Return authenticated status with user info
    res.status(200).json({
      authenticated: true,
      userInfo: userInfo,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    // On error, return not authenticated
    return res.status(200).json({ authenticated: false });
  }
});

// New endpoint: Logout/disconnect from Google
app.post('/api/auth/logout', (req, res) => {
  if (!req.session.userEmail) {
    return res.status(400).json({ success: false, message: 'User not logged in' });
  }

  // Clear session
  const userEmail = req.session.userEmail;
  req.session.destroy(err => {
    if (err) {
      console.error(`Error destroying session: ${err}`);
      return res.status(500).json({ success: false, message: 'Error during logout' });
    }
    console.log(`Session cleared for user: ${userEmail}`);
    res.status(200).json({ success: true, message: 'Successfully logged out' });
  });
});

// Task 2: Implement middleware for authenticated routes
const requireAuth = async (req, res, next) => {
  // Check if user is authenticated via session
  if (!req.session.tokens || !req.session.userEmail) {
    return res.status(401).send('Authentication required: Please login again via /auth/google.');
  }

  const tokens = req.session.tokens;
  const userEmail = req.session.userEmail;

  console.log(`Using authenticated user: ${userEmail}`);

  // Create a new OAuth2 client instance for this user request
  const userClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
  userClient.setCredentials(tokens);

  try {
    // Check if the access token is expired and refresh if necessary
    await userClient.getAccessToken();

    // Check if the token was refreshed and update the session
    if (userClient.credentials.access_token !== tokens.access_token) {
      console.log(`Access token refreshed for user: ${userEmail}`);
      req.session.tokens = userClient.credentials; // Update session with new tokens
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
    // Clear invalid tokens from the session
    delete req.session.tokens;
    delete req.session.userEmail;
    delete req.session.userInfo;
    return res
      .status(401)
      .send('Authentication failed or token expired. Please login again via /auth/google.');
  }
};

// Task 2: Implement Logout
app.get('/auth/logout', (req, res) => {
  if (!req.session.userEmail) {
    return res.status(400).send('User not identified or not logged in.');
  }

  // Clear session
  const userEmail = req.session.userEmail;
  req.session.destroy(err => {
    if (err) {
      console.error(`Error destroying session: ${err}`);
      return res.status(500).send('Error during logout.');
    }
    console.log(`Session cleared for user: ${userEmail}`);
    res.send('Logout successful.');
  });
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

// ------ CALENDAR API ENDPOINTS -------

// Get all calendar events for the authenticated user
app.get('/api/calendar/events', requireAuth, async (req, res) => {
  try {
    console.log(`Fetching calendar events for user: ${req.userEmail}`);

    // Optional query parameters for filtering
    const timeMin = req.query.timeMin || new Date().toISOString();
    const timeMax = req.query.timeMax;
    const maxResults = parseInt(req.query.maxResults) || 50;

    const options = {
      timeMin,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    };

    if (timeMax) {
      options.timeMax = timeMax;
    }

    const data = await calendarHelper.listEvents(req.googleClient, options);
    res.json({
      success: true,
      events: data.items,
      nextSyncToken: data.nextSyncToken,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'fetch_error',
        status,
      },
    });
  }
});

// Create a calendar event for a project milestone
app.post('/api/calendar/milestones/:milestoneId', requireAuth, async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { projectId, title, description, dueDate } = req.body;

    console.log(`Creating calendar event for milestone ${milestoneId}, project ${projectId}`);

    // Create the calendar event
    const eventData = {
      title: title || `Project Milestone`,
      description: description || '',
      startTime: dueDate,
      entityType: 'project_milestone',
      entityId: milestoneId,
    };

    const calendarEvent = await calendarHelper.createEvent(req.googleClient, eventData);

    // TODO: Store the event ID in your database for future reference
    console.log('Created calendar event with ID:', calendarEvent.id);

    res.json({
      success: true,
      event: calendarEvent,
      eventId: calendarEvent.id,
      message: 'Milestone added to Google Calendar',
    });
  } catch (error) {
    console.error('Error creating calendar event for milestone:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'milestone_event_error',
        status,
      },
    });
  }
});

// Create a calendar event for a work order
app.post('/api/calendar/workorders/:workOrderId', requireAuth, async (req, res) => {
  try {
    const { workOrderId } = req.params;
    const { title, description, scheduledDate, dueByDate, location } = req.body;

    console.log(`Creating calendar event for work order ${workOrderId}`);

    // Create the calendar event
    const eventData = {
      title: title || `Work Order`,
      description: description || '',
      startTime: scheduledDate,
      endTime: dueByDate,
      location: location || '',
      entityType: 'work_order',
      entityId: workOrderId,
    };

    const calendarEvent = await calendarHelper.createEvent(req.googleClient, eventData);

    // TODO: Store the event ID in your database for future reference
    console.log('Created calendar event with ID:', calendarEvent.id);

    res.json({
      success: true,
      event: calendarEvent,
      eventId: calendarEvent.id,
      message: 'Work order added to Google Calendar',
    });
  } catch (error) {
    console.error('Error creating calendar event for work order:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'work_order_event_error',
        status,
      },
    });
  }
});

// Create a calendar event for a contact meeting
app.post('/api/calendar/contacts/meetings/:interactionId', requireAuth, async (req, res) => {
  try {
    const { interactionId } = req.params;
    const {
      contactName,
      subject,
      notes,
      scheduledDate,
      duration = 60, // Default duration 60 minutes
      location,
    } = req.body;

    console.log(`Creating calendar event for contact interaction ${interactionId}`);

    // Calculate end time (scheduledDate + duration minutes)
    const startTime = new Date(scheduledDate);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // Create the calendar event
    const eventData = {
      title: subject || `Meeting with ${contactName || 'Contact'}`,
      description: notes || '',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: location || '',
      entityType: 'contact_interaction',
      entityId: interactionId,
    };

    const calendarEvent = await calendarHelper.createEvent(req.googleClient, eventData);

    // TODO: Store the event ID in your database for future reference
    console.log('Created calendar event with ID:', calendarEvent.id);

    res.json({
      success: true,
      event: calendarEvent,
      eventId: calendarEvent.id,
      message: 'Meeting added to Google Calendar',
    });
  } catch (error) {
    console.error('Error creating calendar event for contact meeting:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'contact_meeting_event_error',
        status,
      },
    });
  }
});

// Update an existing calendar event
app.put('/api/calendar/events/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { calendarId = 'primary', ...eventData } = req.body;

    console.log(`Updating calendar event ${eventId}`);

    const updatedEvent = await calendarHelper.updateEvent(
      req.googleClient,
      eventId,
      eventData,
      calendarId
    );

    res.json({
      success: true,
      event: updatedEvent,
      eventId: updatedEvent.id,
      message: 'Calendar event updated',
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'update_event_error',
        status,
      },
    });
  }
});

// Delete a calendar event
app.delete('/api/calendar/events/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const calendarId = req.query.calendarId || 'primary';

    // Delete the event
    await calendarHelper.deleteEvent(req.googleClient, eventId, calendarId);

    res.json({
      success: true,
      message: 'Calendar event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'delete_event_error',
        status,
      },
    });
  }
});

// Time entry calendar integration
app.post('/api/calendar/timeentries/:timeEntryId', requireAuth, async (req, res) => {
  try {
    const { timeEntryId } = req.params;
    const { title, description, workDate, startTime, endTime, employeeName, projectId } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, startTime, and endTime are required',
        errorDetails: {
          type: 'validation_error',
          status: 400,
        },
      });
    }

    // Create a calendar event for the time entry
    const eventData = {
      title,
      description: description || `Work logged: ${employeeName || 'Employee'}`,
      startTime,
      endTime,
      location: '',
      entityType: 'time_entry',
      entityId: timeEntryId,
      // Add additional metadata for the event
      extendedProperties: {
        private: {
          timeEntryId,
          projectId: projectId || '',
          employeeName: employeeName || '',
        },
      },
    };

    const event = await calendarHelper.createEvent(req.googleClient, eventData);

    // Return the created event
    res.json({
      success: true,
      event,
      eventId: event.id,
      message: 'Time entry calendar event created successfully',
    });
  } catch (error) {
    console.error('Error creating time entry calendar event:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'time_entry_event_error',
        status,
      },
    });
  }
});

// Get the list of user's calendars
app.get('/api/calendar/list', requireAuth, async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: req.googleClient });

    const response = await calendar.calendarList.list({
      minAccessRole: 'writer', // Only include calendars where the user can create events
    });

    const calendars = response.data.items.map(cal => ({
      id: cal.id,
      summary: cal.summary,
      description: cal.description,
      primary: cal.primary,
      backgroundColor: cal.backgroundColor,
      foregroundColor: cal.foregroundColor,
    }));

    res.json({
      success: true,
      calendars,
    });
  } catch (error) {
    console.error('Error fetching calendars:', error);
    const status = error.response?.status || error.code || 500;
    const message = error.errors?.[0]?.message || error.message || 'Unknown error';
    res.status(status).json({
      success: false,
      error: message,
      errorDetails: {
        type: 'fetch_calendars_error',
        status,
      },
    });
  }
});

// Update or create organization calendar with AJC Projects shared calendar ID
app.post('/api/organization-calendar/update', requireAuth, async (req, res) => {
  try {
    // Check if Supabase client is available
    if (!supabaseAdmin) {
      throw new Error('Supabase client not initialized');
    }

    // The AJC Projects shared calendar ID
    const AJC_PROJECTS_CALENDAR_ID =
      'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com';

    // First check if an organization calendar already exists
    const { data: existingCalendar, error: fetchError } = await supabaseAdmin
      .from('organization_calendar')
      .select('*')
      .order('created_at')
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Error fetching organization calendar: ${fetchError.message}`);
    }

    let resultCalendar;

    if (existingCalendar) {
      // Update existing calendar
      console.log(
        `Updating organization calendar ${existingCalendar.id} with AJC Projects calendar ID`
      );

      const { data: updatedCalendar, error: updateError } = await supabaseAdmin
        .from('organization_calendar')
        .update({
          google_calendar_id: AJC_PROJECTS_CALENDAR_ID,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCalendar.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error updating organization calendar: ${updateError.message}`);
      }

      resultCalendar = updatedCalendar;
    } else {
      // Create new calendar
      console.log('Creating new organization calendar with AJC Projects calendar ID');

      const { data: newCalendar, error: insertError } = await supabaseAdmin
        .from('organization_calendar')
        .insert({
          name: 'AJC Projects Calendar',
          google_calendar_id: AJC_PROJECTS_CALENDAR_ID,
          is_enabled: true,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Error creating organization calendar: ${insertError.message}`);
      }

      resultCalendar = newCalendar;
    }

    res.json({
      success: true,
      message: `AJC Projects shared calendar ID successfully ${existingCalendar ? 'updated' : 'created'}`,
      calendar: resultCalendar,
    });
  } catch (error) {
    console.error('Error updating organization calendar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      errorDetails: {
        type: 'update_organization_calendar_error',
      },
    });
  }
});

// Get user info for Google account
app.get('/api/auth/status', requireAuth, async (req, res) => {
  try {
    // Get user information
    const oauth2 = google.oauth2({
      auth: req.googleClient,
      version: 'v2',
    });

    const userInfoResponse = await oauth2.userinfo.get();

    res.json({
      authenticated: true,
      userInfo: {
        email: userInfoResponse.data.email,
        name: userInfoResponse.data.name,
        picture: userInfoResponse.data.picture,
      },
    });
  } catch (error) {
    console.error('Error getting auth status:', error);
    res.json({
      authenticated: false,
      error: error.message,
    });
  }
});

// ------ NEW SCHEDULE ITEM CALENDAR SYNC ENDPOINT -------

app.post('/api/schedule-items/:itemId/sync-calendar', requireAuth, async (req, res) => {
  const { itemId } = req.params;
  console.log(`[Calendar Sync] Received request for schedule item ID: ${itemId}`);

  try {
    // 1. Fetch the schedule item from Supabase
    const { data: item, error: itemError } = await supabaseAdmin
      .from('schedule_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) throw new Error(`Failed to fetch schedule item: ${itemError.message}`);
    if (!item) throw new Error('Schedule item not found.');

    console.log(`[Calendar Sync] Found item: ${item.title}`);

    let assigneeEmail = null;
    let attendees = [];

    // 2. Fetch assignee email if applicable
    if (item.assignee_id && item.assignee_type) {
      console.log(
        `[Calendar Sync] Fetching assignee (${item.assignee_type}) ID: ${item.assignee_id}`
      );
      if (item.assignee_type === 'employee') {
        const { data: emp, error: empError } = await supabaseAdmin
          .from('employees')
          .select('email')
          .eq('employee_id', item.assignee_id)
          .single();
        if (empError) console.error(`Error fetching employee email: ${empError.message}`);
        assigneeEmail = emp?.email;
      } else if (item.assignee_type === 'subcontractor') {
        const { data: sub, error: subError } = await supabaseAdmin
          .from('subcontractors')
          .select('contactemail') // Use contactemail
          .eq('subid', item.assignee_id)
          .single();
        if (subError) console.error(`Error fetching subcontractor email: ${subError.message}`);
        assigneeEmail = sub?.contactemail;
      }

      if (assigneeEmail) {
        attendees.push({ email: assigneeEmail });
        console.log(`[Calendar Sync] Found assignee email: ${assigneeEmail}`);
      } else {
        console.warn(
          `[Calendar Sync] Assignee email not found for ${item.assignee_type} ID: ${item.assignee_id}`
        );
      }
    } else {
      console.log(`[Calendar Sync] No assignee for this item.`);
    }

    // 3. Determine Target Calendar ID (Placeholder - using primary for now)
    // TODO: Implement logic to get shared project calendar ID based on item.project_id
    const targetCalendarId = 'primary';
    console.log(`[Calendar Sync] Target Calendar ID: ${targetCalendarId}`);

    // 4. Prepare Event Data
    const eventData = {
      title: item.title,
      description: item.description || '',
      startTime: item.start_datetime, // Already ISO string
      endTime: item.end_datetime, // Already ISO string
      attendees: attendees,
      targetCalendarId: targetCalendarId,
      entityType: 'schedule_item', // Link event back to schedule item
      entityId: item.id,
      sendNotifications: true, // Explicitly set to true if we have attendees
    };

    let googleEventId = item.google_event_id;
    let syncStatus = 'success';
    let syncError = null;

    // 5. Call Calendar Helper (Create or Update)
    try {
      if (googleEventId) {
        console.log(`[Calendar Sync] Updating existing Google Event ID: ${googleEventId}`);
        const updatedEvent = await calendarHelper.updateEvent(
          req.googleClient,
          googleEventId,
          eventData,
          targetCalendarId
        );
        console.log(`[Calendar Sync] Event updated successfully.`);
      } else {
        console.log(`[Calendar Sync] Creating new Google Event.`);
        const createdEvent = await calendarHelper.createEvent(req.googleClient, eventData);
        googleEventId = createdEvent.id;
        console.log(`[Calendar Sync] Event created successfully with ID: ${googleEventId}`);
      }
    } catch (calendarError) {
      console.error('[Calendar Sync] Google API Error:', calendarError.message);
      syncStatus = 'error';
      syncError = calendarError.message;
      // Don't re-throw, just record the error and proceed to update Supabase
    }

    // 6. Update Schedule Item in Supabase with sync status
    const { error: updateError } = await supabaseAdmin
      .from('schedule_items')
      .update({
        google_event_id: googleEventId, // Store the ID even if sync failed (allows retry/debug)
        invite_status:
          syncStatus === 'success'
            ? attendees.length > 0
              ? 'invite_sent'
              : 'synced_no_invite'
            : 'sync_error',
        last_sync_error: syncError,
        calendar_integration_enabled: true, // Mark as attempted/enabled
      })
      .eq('id', itemId);

    if (updateError) {
      // Log this critical error, as the state is now inconsistent
      console.error(
        `[Calendar Sync] CRITICAL: Failed to update schedule_item ${itemId} after calendar sync attempt: ${updateError.message}`
      );
      // Still return the original sync status to the client
    }

    // 7. Return Response
    if (syncStatus === 'success') {
      res.json({ success: true, message: 'Calendar sync successful.', eventId: googleEventId });
    } else {
      // Return a 500 but include details
      res.status(500).json({ success: false, error: 'Calendar sync failed.', details: syncError });
    }
  } catch (error) {
    console.error(`[Calendar Sync] Error processing sync for item ${itemId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during calendar sync.',
    });
  }
});

// ------ END NEW SCHEDULE ITEM CALENDAR SYNC ENDPOINT -------

// Add this function to completely clear authentication state
app.get('/auth/clear', (req, res) => {
  console.log('Clearing all authentication state');

  // Clear the current user's session
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err);
      } else {
        console.log('Session cleared successfully');
      }
    });
  }

  res.redirect('/');
});

// --- Start Server ---
// Use port 3000 for the backend API server
app.listen(3000, () => {
  console.log(`Backend server listening on http://localhost:3000`); // Updated log message
  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI || !process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('!!! WARNING: One or more Google API credentials are missing in .env file.');
  }
});

// module.exports = { app, oauth2Client }; // Comment out or remove exports if not needed for testing framework
