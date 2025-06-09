// Google Calendar Authentication Module for Production Server
// This module handles OAuth2 flow and calendar operations

const { google } = require('googleapis');
const crypto = require('crypto');

// OAuth2 Configuration
// Support multiple possible redirect URIs
const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/auth/google/callback';

console.log('OAuth Configuration:', {
  clientIdConfigured: !!(process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID),
  clientSecretConfigured: !!(process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET),
  redirectUri: redirectUri,
});

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// This function will now create a new client for each request
const getOauth2Client = () => {
  console.log('=== CREATING OAUTH2 CLIENT ===');
  console.log('[OAuth] Environment variables check:');
  console.log(`  - GOOGLE_CLIENT_ID exists: ${!!process.env.GOOGLE_CLIENT_ID}`);
  console.log(
    `  - GOOGLE_CLIENT_ID raw length: ${process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.length : 0}`
  );
  console.log(`  - GOOGLE_CLIENT_ID value: ${process.env.GOOGLE_CLIENT_ID || 'UNDEFINED'}`);
  console.log(`  - GOOGLE_CLIENT_SECRET exists: ${!!process.env.GOOGLE_CLIENT_SECRET}`);
  console.log(
    `  - GOOGLE_CLIENT_SECRET raw length: ${process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.length : 0}`
  );
  console.log(
    `  - GOOGLE_CLIENT_SECRET first 10 chars: ${process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'UNDEFINED'}`
  );
  console.log(`  - redirectUri: ${redirectUri}`);

  // Additional validation
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('[OAuth] CRITICAL ERROR: GOOGLE_CLIENT_ID is undefined!');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('[OAuth] CRITICAL ERROR: GOOGLE_CLIENT_SECRET is undefined!');
  }
  if (!redirectUri) {
    console.error('[OAuth] CRITICAL ERROR: redirectUri is undefined!');
  }

  console.log('[OAuth] Creating Google OAuth2 client with above credentials...');

  // Trim environment variables to remove any newline characters
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  console.log('[OAuth] After trimming:');
  console.log(`  - clientId length: ${clientId ? clientId.length : 0}`);
  console.log(`  - clientSecret length: ${clientSecret ? clientSecret.length : 0}`);

  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  console.log('[OAuth] OAuth2 client created successfully');
  console.log('=== OAUTH2 CLIENT CREATED ===');
  return client;
};

// Use Supabase for session storage in production, fallback to in-memory for development
let sessionStore;

if (process.env.NODE_ENV === 'production' && process.env.SUPABASE_URL) {
  // Use Supabase session storage in production
  try {
    sessionStore = require('./server-supabase-session-store.cjs');
    console.log('Using Supabase session storage');
  } catch (error) {
    console.error('Failed to load Supabase session storage:', error);
    // Fallback to in-memory
    sessionStore = createInMemoryStore();
  }
} else {
  // Use in-memory storage for development
  sessionStore = createInMemoryStore();
  console.log('Using in-memory session storage (development mode)');
}

// In-memory storage fallback
function createInMemoryStore() {
  const sessions = new Map();

  // Clean up expired sessions
  setInterval(
    () => {
      const now = Date.now();
      for (const [sessionId, session] of sessions.entries()) {
        if (now - session.createdAt > 24 * 60 * 60 * 1000) {
          sessions.delete(sessionId);
        }
      }
    },
    60 * 60 * 1000
  );

  return {
    createSession: (userId, tokens) => {
      const sessionId = crypto.randomBytes(32).toString('hex');
      sessions.set(sessionId, {
        userId,
        tokens,
        createdAt: Date.now(),
      });
      return Promise.resolve(sessionId);
    },
    getSession: sessionId => Promise.resolve(sessions.get(sessionId)),
    updateSession: (sessionId, updates) => {
      const session = sessions.get(sessionId);
      if (session) {
        Object.assign(session, updates);
      }
      return Promise.resolve(session);
    },
    deleteSession: sessionId => {
      sessions.delete(sessionId);
      return Promise.resolve();
    },
  };
}

// Use the session store functions
const { createSession, getSession, updateSession, deleteSession } = sessionStore;

// OAuth endpoints
function setupGoogleCalendarAuth(app) {
  // Session middleware
  app.use(async (req, res, next) => {
    const sessionId = req.headers.cookie?.match(/session=([^;]+)/)?.[1];
    if (sessionId) {
      try {
        req.session = await getSession(sessionId);
      } catch (error) {
        console.error('Session middleware error:', error);
      }
    }
    next();
  });

  // Check authentication status
  app.get('/api/auth/status', async (req, res) => {
    try {
      if (req.session && req.session.tokens) {
        res.json({
          authenticated: true,
          userId: req.session.userId,
        });
      } else {
        res.json({ authenticated: false });
      }
    } catch (error) {
      console.error('Auth status error:', error);
      res.json({ authenticated: false });
    }
  });

  // Initiate OAuth flow (support both routes)
  const handleOAuthStart = (req, res) => {
    console.log('=== OAUTH FLOW START ===');
    console.log('[OAuth] Timestamp:', new Date().toISOString());
    console.log('[OAuth] Request URL:', req.url);
    console.log('[OAuth] Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[OAuth] User Agent:', req.get('User-Agent'));
    console.log('[OAuth] Referer:', req.get('Referer'));

    console.log('[OAuth] Creating OAuth2 client...');
    const oauth2Client = getOauth2Client(); // Create client just-in-time

    const authParams = {
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    };
    console.log('[OAuth] Auth parameters:', JSON.stringify(authParams, null, 2));

    const authUrl = oauth2Client.generateAuthUrl(authParams);
    console.log('[OAuth] Generated full Auth URL:', authUrl);

    // Parse and log URL components
    try {
      const urlObj = new URL(authUrl);
      console.log('[OAuth] Auth URL host:', urlObj.host);
      console.log('[OAuth] Auth URL pathname:', urlObj.pathname);
      console.log('[OAuth] Auth URL search params:');
      for (const [key, value] of urlObj.searchParams) {
        if (key === 'client_id') {
          console.log(`  ${key}: ${value}`);
        } else if (key === 'redirect_uri') {
          console.log(`  ${key}: ${value}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
    } catch (e) {
      console.error('[OAuth] Error parsing auth URL:', e);
    }

    console.log('[OAuth] Redirecting user to Google...');
    console.log('=== OAUTH FLOW REDIRECT ===');
    res.redirect(authUrl);
  };

  app.get('/auth/google', handleOAuthStart);
  app.get('/api/auth/google', handleOAuthStart);

  // Handle OAuth callback (support both routes)
  const handleOAuthCallback = async (req, res) => {
    console.log('=== OAUTH CALLBACK START ===');
    console.log('[OAuth] Callback timestamp:', new Date().toISOString());
    console.log('[OAuth] Callback URL:', req.url);
    console.log('[OAuth] Callback query params:', JSON.stringify(req.query, null, 2));
    console.log('[OAuth] Callback headers:', JSON.stringify(req.headers, null, 2));

    const { code, error, error_description, state } = req.query;

    console.log('[OAuth] Extracted params:');
    console.log(
      '  - code:',
      code ? `Present (${code.substring(0, 10)}...${code.substring(code.length - 10)})` : 'MISSING'
    );
    console.log('  - error:', error || 'None');
    console.log('  - error_description:', error_description || 'None');
    console.log('  - state:', state || 'None');

    if (error) {
      console.error('[OAuth] GOOGLE RETURNED ERROR:', error);
      console.error('[OAuth] ERROR DESCRIPTION:', error_description);
      console.error('[OAuth] FULL CALLBACK URL:', req.url);
      return res.redirect(
        `/?error=google_error&details=${encodeURIComponent(error_description || error)}`
      );
    }

    if (!code) {
      console.error('[OAuth] CRITICAL: No authorization code received');
      console.error('[OAuth] This indicates Google rejected the request before callback');
      return res.redirect('/?error=no_code');
    }

    try {
      console.log('[OAuth] Attempting to exchange code for tokens...');
      const oauth2Client = getOauth2Client(); // Create client just-in-time

      console.log('[OAuth] Making token request to Google...');
      const tokenResponse = await oauth2Client.getToken(code);
      const { tokens } = tokenResponse;

      console.log('[OAuth] Token exchange successful!');
      console.log('[OAuth] Received tokens:');
      console.log(
        '  - access_token:',
        tokens.access_token ? `Present (${tokens.access_token.substring(0, 10)}...)` : 'MISSING'
      );
      console.log(
        '  - refresh_token:',
        tokens.refresh_token ? `Present (${tokens.refresh_token.substring(0, 10)}...)` : 'MISSING'
      );
      console.log('  - scope:', tokens.scope || 'Not provided');
      console.log('  - token_type:', tokens.token_type || 'Not provided');
      console.log('  - expiry_date:', tokens.expiry_date || 'Not provided');

      oauth2Client.setCredentials(tokens);

      // Get user info
      console.log('[OAuth] Attempting to get user info...');
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfoResponse = await oauth2.userinfo.get();
      const { data: userInfo } = userInfoResponse;

      console.log('[OAuth] User info retrieved successfully:');
      console.log('  - email:', userInfo.email);
      console.log('  - name:', userInfo.name);
      console.log('  - verified_email:', userInfo.verified_email);

      // Create session
      console.log('[OAuth] Creating session...');
      const sessionId = await createSession(userInfo.email, tokens);
      console.log(`[OAuth] Session created successfully with ID: ...${sessionId.slice(-8)}`);

      // Set session cookie
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };
      console.log(
        '[OAuth] Setting session cookie with options:',
        JSON.stringify(cookieOptions, null, 2)
      );
      res.cookie('session', sessionId, cookieOptions);

      // Redirect to calendar settings with success
      const successUrl = '/settings/calendar?connected=true';
      console.log('[OAuth] Redirecting to success page:', successUrl);
      console.log('=== OAUTH FLOW SUCCESS ===');
      res.redirect(successUrl);
    } catch (error) {
      console.error('=== OAUTH FLOW ERROR ===');
      console.error('[OAuth] FATAL ERROR occurred during token exchange or user info retrieval');
      console.error('[OAuth] Error name:', error.name);
      console.error('[OAuth] Error message:', error.message);
      console.error('[OAuth] Error stack:', error.stack);
      if (error.response) {
        console.error('[OAuth] Error response status:', error.response.status);
        console.error(
          '[OAuth] Error response headers:',
          JSON.stringify(error.response.headers, null, 2)
        );
        console.error('[OAuth] Error response data:', JSON.stringify(error.response.data, null, 2));
      }
      console.error('[OAuth] Full error object:', JSON.stringify(error, null, 2));
      console.error('=== OAUTH ERROR END ===');

      const errorUrl = `/settings/calendar?error=auth_failed&details=${encodeURIComponent(error.message)}`;
      console.log('[OAuth] Redirecting to error page:', errorUrl);
      res.redirect(errorUrl);
    }
  };

  app.get('/auth/google/callback', handleOAuthCallback);
  app.get('/api/auth/google/callback', handleOAuthCallback);

  // Logout endpoint
  app.post('/api/auth/logout', async (req, res) => {
    try {
      const sessionId = req.headers.cookie?.match(/session=([^;]+)/)?.[1];
      if (sessionId) {
        await deleteSession(sessionId);
      }
      res.clearCookie('session');
      res.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  });

  // Calendar API endpoints

  // List calendars
  app.get('/api/calendar/list', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const oauth2Client = getOauth2Client(); // Create client just-in-time
      oauth2Client.setCredentials(req.session.tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const { data } = await calendar.calendarList.list();
      res.json(data.items || []);
    } catch (error) {
      console.error('Calendar list error:', error);
      res.status(500).json({ error: 'Failed to fetch calendars' });
    }
  });

  // Get calendar events
  app.get('/api/calendar/events', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const oauth2Client = getOauth2Client(); // Create client just-in-time
      oauth2Client.setCredentials(req.session.tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const { calendarId = 'primary', timeMin, timeMax } = req.query;

      const { data } = await calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      res.json(data.items || []);
    } catch (error) {
      console.error('Calendar events error:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  // Create calendar event
  app.post('/api/calendar/events', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const oauth2Client = getOauth2Client(); // Create client just-in-time
      oauth2Client.setCredentials(req.session.tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const { calendarId = 'primary', ...eventData } = req.body;

      const { data } = await calendar.events.insert({
        calendarId,
        requestBody: eventData,
      });

      res.json(data);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  });

  // Update calendar event
  app.put('/api/calendar/events/:eventId', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const oauth2Client = getOauth2Client(); // Create client just-in-time
      oauth2Client.setCredentials(req.session.tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const { eventId } = req.params;
      const { calendarId = 'primary', ...eventData } = req.body;

      const { data } = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: eventData,
      });

      res.json(data);
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  });

  // Delete calendar event
  app.delete('/api/calendar/events/:eventId', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const oauth2Client = getOauth2Client(); // Create client just-in-time
      oauth2Client.setCredentials(req.session.tokens);
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const { eventId } = req.params;
      const { calendarId = 'primary' } = req.query;

      await calendar.events.delete({
        calendarId,
        eventId,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  // Schedule item sync endpoint
  app.post('/api/schedule-items/:itemId/sync-calendar', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { itemId } = req.params;

    // TODO: Implement actual sync logic with schedule_items table
    // For now, return success to test the frontend
    res.json({
      success: true,
      message: 'Calendar sync endpoint ready for implementation',
      itemId,
    });
  });
}

module.exports = { setupGoogleCalendarAuth };
