// Body Parser Middleware with Enhanced Logging
// This module provides middleware to properly parse and log request bodies

function setupBodyParser(app) {
  // Add body parsing middleware with error handling
  app.use(
    express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for debugging if needed
        req.rawBody = buf.toString('utf8');
      },
    })
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: '10mb',
    })
  );

  // Request logging middleware
  app.use((req, res, next) => {
    // Skip logging for static files and health checks
    if (
      req.path.startsWith('/static') ||
      req.path === '/health' ||
      req.path === '/favicon.ico' ||
      (req.method === 'GET' && !req.path.startsWith('/api'))
    ) {
      return next();
    }

    // Log request details
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);

    // Only log body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && Object.keys(req.body).length > 0) {
        // Log body but hide sensitive data
        const sanitizedBody = sanitizeBody(req.body);
        console.log(`[${timestamp}] Request body:`, JSON.stringify(sanitizedBody, null, 2));
      } else if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
        // This is likely where "Processed form data: undefined" was coming from
        console.log(`[${timestamp}] Request body is empty or undefined`);
      }
    }

    next();
  });

  // Error handling for body parsing
  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      console.error('[Body Parser Error] Invalid JSON:', error.message);
      return res.status(400).json({
        error: 'Invalid JSON in request body',
        message: error.message,
      });
    }
    next(error);
  });
}

// Helper function to sanitize sensitive data in logs
function sanitizeBody(body) {
  const sensitive = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  for (const key in sanitized) {
    // Check if key contains sensitive terms
    if (sensitive.some(term => key.toLowerCase().includes(term))) {
      sanitized[key] = '[REDACTED]';
    }
    // Recursively sanitize nested objects
    else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }

  return sanitized;
}

// Debug endpoint to test form processing
function setupDebugEndpoints(app) {
  // Test endpoint for form data processing
  app.post('/api/debug/test-form', (req, res) => {
    console.log('[Debug] Test form endpoint called');
    console.log('[Debug] Headers:', req.headers);
    console.log('[Debug] Body type:', typeof req.body);
    console.log('[Debug] Body:', req.body);
    console.log('[Debug] Raw body available:', !!req.rawBody);

    res.json({
      received: true,
      bodyType: typeof req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      isEmpty: !req.body || Object.keys(req.body).length === 0,
      contentType: req.get('content-type'),
      timestamp: new Date().toISOString(),
    });
  });

  // Endpoint to check current request parsing status
  app.get('/api/debug/parser-status', (req, res) => {
    res.json({
      jsonParser: !!app._router.stack.find(layer => layer.name === 'jsonParser'),
      urlencodedParser: !!app._router.stack.find(layer => layer.name === 'urlencodedParser'),
      timestamp: new Date().toISOString(),
    });
  });
}

module.exports = { setupBodyParser, setupDebugEndpoints };
