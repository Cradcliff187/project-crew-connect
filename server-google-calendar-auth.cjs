// Google Calendar Authentication Module for Production Server
// This module handles OAuth2 flow and calendar operations

const { google } = require('googleapis');
const crypto = require('crypto');

// OAuth2 Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI ||
    'https://project-crew-connect-1061142868787.us-east5.run.app/auth/google/callback'
);

// Scopes required for calendar operations
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// In-memory session storage (should be replaced with Redis or database in production)
const sessions = new Map();

// Session management functions
function createSession(userId, tokens) {
  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, {
    userId,
    tokens,
    createdAt: Date.now(),
  });
  return sessionId;
}

function getSession(sessionId) {
  return sessions.get(sessionId);
}

function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

// Clean up expired sessions (older than 24 hours)
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
); // Run every hour

// OAuth endpoints
function setupGoogleCalendarAuth(app) {
  // Session middleware
  app.use((req, res, next) => {
    const sessionId = req.headers.cookie?.match(/session=([^;]+)/)?.[1];
    if (sessionId) {
      req.session = getSession(sessionId);
    }
    next();
  });

  // Check authentication status
  app.get('/api/auth/status', (req, res) => {
    if (req.session && req.session.tokens) {
      res.json({
        authenticated: true,
        userId: req.session.userId,
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Initiate OAuth flow
  app.get('/auth/google', (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
    res.redirect(authUrl);
  });

  // Handle OAuth callback
  app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.redirect('/?error=no_code');
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data: userInfo } = await oauth2.userinfo.get();

      // Create session
      const sessionId = createSession(userInfo.email, tokens);

      // Set session cookie
      res.cookie('session', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Redirect to calendar settings with success
      res.redirect('/settings/calendar?connected=true');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/settings/calendar?error=auth_failed');
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    const sessionId = req.headers.cookie?.match(/session=([^;]+)/)?.[1];
    if (sessionId) {
      deleteSession(sessionId);
    }
    res.clearCookie('session');
    res.json({ success: true });
  });

  // Calendar API endpoints

  // List calendars
  app.get('/api/calendar/list', async (req, res) => {
    if (!req.session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
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
