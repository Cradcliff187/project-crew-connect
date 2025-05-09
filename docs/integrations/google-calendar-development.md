# Google Calendar Integration - Development Mode

This document explains the development mode functionality in the Google Calendar integration service and how to use it while developing or testing the application without a live Google Calendar API connection.

## Overview

The Google Calendar integration includes a development mode that provides mock responses to API requests. This allows developers to test the application's calendar functionality without:

1. Setting up a Google Cloud Project
2. Configuring OAuth credentials
3. Having a running API server

## How Development Mode Works

The `GoogleCalendarService` class includes a development mode flag (`_isDevelopmentMode`) that, when enabled:

1. Returns standardized mock responses for all API operations
2. Provides realistic-looking data for testing
3. Avoids making actual network requests to the Google Calendar API
4. Prevents console errors when the API endpoint is not available

## Development Mode Configuration

### Automatic Detection

Development mode is automatically enabled in development environments through:

```typescript
const IS_DEVELOPMENT = import.meta.env.DEV;
```

This environment flag is set by Vite during development builds.

### Manual Control

You can also manually control development mode through the service's methods:

```typescript
// Import the service
import { googleCalendarService } from '@/services/googleCalendarService';

// Check if development mode is enabled
const isDev = googleCalendarService.isDevelopmentMode;

// Enable development mode manually
googleCalendarService.setDevelopmentMode(true);

// Disable development mode manually
googleCalendarService.setDevelopmentMode(false);
```

## Mock Responses

Development mode provides the following mock responses:

### Authentication Status

```typescript
// Returns false by default, but doesn't throw errors
const isAuthorized = await googleCalendarService.isAuthorized();
```

### Event Creation

```typescript
const createResponse = await googleCalendarService.createEvent({
  title: 'New Event',
  start_datetime: '2023-04-01T10:00:00Z',
  end_datetime: '2023-04-01T11:00:00Z',
  // other fields...
});

// Returns a mock event with:
// - Generated mock IDs
// - All input fields preserved
// - Current timestamps for created_at/updated_at
```

### Event Update

```typescript
const updateResponse = await googleCalendarService.updateEvent('some-id', {
  title: 'Updated Event Title',
  // other fields...
});

// Returns updated mock event with:
// - Original ID preserved
// - Updated fields reflected
// - New updated_at timestamp
```

### Event Deletion

```typescript
const deleteResponse = await googleCalendarService.deleteEvent('some-id');

// Returns { success: true } without errors
```

### Event Listing

```typescript
const events = await googleCalendarService.listEvents(
  '2023-04-01T00:00:00Z',
  '2023-04-30T23:59:59Z'
);

// Returns an array with a single mock event:
// - Fixed mock IDs
// - Generic title/description
// - Date range matching the query parameters
```

### Entity Synchronization

```typescript
const syncResponse = await googleCalendarService.syncEntityWithCalendar(
  'project_milestone',
  'milestone-123'
);

// Returns a mock event with:
// - Generated mock IDs
// - Entity type and ID preserved
// - Current timestamps
```

## Switching to Production Mode

When you're ready to test with the actual Google Calendar API:

1. Ensure your API server is running (typically at `http://localhost:3000/api`)
2. Set up the required OAuth credentials in Google Cloud Console
3. Configure the appropriate environment variables in your backend
4. Manually disable development mode if needed:
   ```typescript
   googleCalendarService.setDevelopmentMode(false);
   ```

## Troubleshooting

If you encounter issues with the development mode:

1. **Mock data not appearing:** Ensure development mode is enabled by checking `googleCalendarService.isDevelopmentMode`

2. **API calls still being attempted:** Make sure you're using the `googleCalendarService` methods rather than making direct fetch calls to the API

3. **Type errors with mock data:** The mock responses follow the same type structure as real responses, but might be missing some optional fields. Update the mock generation if specific fields are required for your component.

## Future Improvements

Planned enhancements to the development mode include:

1. **Configurable mock data:** Allow developers to specify what kinds of mock events should be returned
2. **Persistent storage:** Simulate a database to maintain state between page refreshes
3. **Customizable auth status:** Toggle mock authentication state for testing different scenarios
4. **Simulated errors:** Generate error responses to test error handling

## Related Documentation

- [Google Calendar Integration Documentation](./google-calendar-integration.md)
- [Google Calendar Authentication Guide](../google-calendar-auth.md)
- [Shared Google Calendar Integration](./shared-calendar-usage.md)
