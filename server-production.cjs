const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

// Import Google Calendar auth module
const { setupGoogleCalendarAuth } = require('./server-google-calendar-auth.cjs');
// Import body parser setup
const { setupBodyParser, setupDebugEndpoints } = require('./server-body-parser-fix.cjs');

const app = express();
const port = process.env.PORT || 8080;

console.log('Starting production server...');
console.log('Port:', port);
console.log('Google Maps API Key configured:', !!process.env.GOOGLE_MAPS_API_KEY);
console.log('Google Client ID configured:', !!process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret configured:', !!process.env.GOOGLE_CLIENT_SECRET);

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins for now
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Set up proper body parsing with logging
setupBodyParser(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', port });
});

// Set up Google Calendar authentication
setupGoogleCalendarAuth(app);

// Debug endpoints are disabled in production for security
if (process.env.NODE_ENV !== 'production') {
  setupDebugEndpoints(app);
  console.log('Debug endpoints enabled at /api/debug/*');
} else {
  console.log('Debug endpoints disabled (production mode)');
}

// Google Maps API proxy endpoints
app.get('/api/maps/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    if (!input) {
      return res.status(400).json({ message: 'Input parameter is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${apiKey}&types=address`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      const predictions = data.predictions || [];
      const suggestions = predictions.map(prediction => ({
        description: prediction.description,
        place_id: prediction.place_id,
      }));
      res.json(suggestions);
    } else {
      console.error('Google Maps API error:', data);
      res.status(500).json({
        message: `Google Maps API error: ${data.status}`,
        error_message: data.error_message,
      });
    }
  } catch (error) {
    console.error('Autocomplete API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/maps/placedetails', async (req, res) => {
  try {
    const { placeid } = req.query;
    if (!placeid) {
      return res.status(400).json({ message: 'PlaceId parameter is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeid
    )}&fields=name,formatted_address,address_components,geometry&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      res.json(data.result);
    } else {
      console.error('Google Maps API error:', data);
      res.status(500).json({
        message: `Google Maps API error: ${data.status}`,
        error_message: data.error_message,
      });
    }
  } catch (error) {
    console.error('Place details API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
app
  .listen(port, '0.0.0.0', () => {
    console.log(`Production server is running on port ${port}`);
    console.log(`API endpoints available at /api/maps/*`);
    console.log(`Health check available at /health`);
  })
  .on('error', err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
