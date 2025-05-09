// Simple API endpoint to handle auth status
const express = require('express');
const router = express.Router();

// Status endpoint to check auth state (mock for development)
router.get('/status', (req, res) => {
  // For development, we'll just return a successful auth state
  res.json({
    authenticated: true,
    userInfo: {
      email: 'calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com',
      name: 'Calendar Sync Bot',
      picture: null,
    },
  });
});

// Logout endpoint (mock for development)
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
