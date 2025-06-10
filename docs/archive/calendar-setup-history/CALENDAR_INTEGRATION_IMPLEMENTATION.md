# Complete Calendar Integration Implementation Plan

## Architecture Overview

### Core Components

1. **Service Account** - For reliable server-side calendar operations
2. **Webhook System** - For real-time two-way sync
3. **Event Queue** - For handling failures and retries
4. **Sync Engine** - For conflict resolution

## Phase 1: Service Account Setup (Foundation)

### Step 1.1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "IAM & Admin" → "Service Accounts"
4. Click "Create Service Account"
   - Name: `akc-calendar-service`
   - Description: "Service account for AKC CRM calendar operations"
5. Grant roles:
   - "Service Account Token Creator"
   - "Calendar API Admin" (if available) or create custom role
6. Create key (JSON format) and download

### Step 1.2: Configure Service Account in Code

```javascript
// server-service-account.cjs
const { google } = require('googleapis');
const path = require('path');

class ServiceAccountAuth {
  constructor() {
    this.auth = null;
  }

  async initialize() {
    try {
      // Option 1: From base64 encoded env var (recommended for production)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
        const keyJson = Buffer.from(
          process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
          'base64'
        ).toString('utf-8');
        const key = JSON.parse(keyJson);

        this.auth = new google.auth.GoogleAuth({
          credentials: key,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
      }
      // Option 2: From file path (for local development)
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        this.auth = new google.auth.GoogleAuth({
          keyFilename: path.resolve(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE),
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
      } else {
        console.warn('No service account credentials configured');
        return false;
      }

      // Test the credentials
      const client = await this.auth.getClient();
      await client.getAccessToken();
      console.log('Service account initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize service account:', error);
      return false;
    }
  }

  async getClient() {
    if (!this.auth) {
      throw new Error('Service account not initialized');
    }
    return await this.auth.getClient();
  }
}

module.exports = new ServiceAccountAuth();
```

## Phase 2: Calendar Permissions Setup

### Step 2.1: Grant Service Account Access

```javascript
// setup-calendar-permissions.js
async function grantServiceAccountAccess() {
  const calendars = [
    {
      id: process.env.VITE_GOOGLE_CALENDAR_PROJECTS,
      name: 'Projects Calendar',
    },
    {
      id: process.env.VITE_GOOGLE_CALENDAR_WORK_ORDER,
      name: 'Work Orders Calendar',
    },
  ];

  for (const cal of calendars) {
    if (!cal.id) continue;

    try {
      const calendar = google.calendar({ version: 'v3', auth: authClient });

      await calendar.acl.insert({
        calendarId: cal.id,
        requestBody: {
          role: 'writer',
          scope: {
            type: 'user',
            value: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          },
        },
      });

      console.log(`✓ Granted service account access to ${cal.name}`);
    } catch (error) {
      if (error.code === 409) {
        console.log(`✓ Service account already has access to ${cal.name}`);
      } else {
        console.error(`✗ Failed to grant access to ${cal.name}:`, error.message);
      }
    }
  }
}
```

## Phase 3: Webhook Implementation (Two-Way Sync)

### Step 3.1: Create Webhook Endpoint

```typescript
// supabase/functions/calendarWebhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async req => {
  try {
    // Verify webhook token
    const token = req.headers.get('X-Goog-Channel-Token');
    if (token !== Deno.env.get('WEBHOOK_TOKEN')) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse notification
    const { resourceId, resourceUri } = req.headers;
    const body = await req.json();

    console.log('Webhook received:', { resourceId, resourceUri, body });

    // Extract calendar and event IDs from resourceUri
    const match = resourceUri?.match(/calendars\/([^\/]+)\/events\/([^\/]+)/);
    if (!match) {
      return new Response('Invalid resource URI', { status: 400 });
    }

    const [, calendarId, eventId] = match;

    // Initialize service account
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY')!),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Fetch the updated event
    let googleEvent;
    try {
      const response = await calendar.events.get({
        calendarId,
        eventId,
      });
      googleEvent = response.data;
    } catch (error) {
      if (error.code === 404) {
        // Event was deleted
        await handleEventDeletion(eventId);
        return new Response('Event deletion processed', { status: 200 });
      }
      throw error;
    }

    // Update our database
    await syncEventToDatabase(googleEvent, calendarId);

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
});

async function syncEventToDatabase(googleEvent: any, calendarId: string) {
  // Find existing schedule item
  const { data: existingItems } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('google_event_id', googleEvent.id)
    .single();

  const scheduleData = {
    title: googleEvent.summary || 'Untitled',
    description: googleEvent.description || '',
    start_datetime: googleEvent.start?.dateTime || googleEvent.start?.date,
    end_datetime: googleEvent.end?.dateTime || googleEvent.end?.date,
    location: googleEvent.location || null,
    calendar_id: calendarId,
    google_event_id: googleEvent.id,
    last_synced_at: new Date().toISOString(),
  };

  if (existingItems) {
    // Update existing
    await supabase.from('schedule_items').update(scheduleData).eq('id', existingItems.id);
  } else {
    // Create new (event created directly in Google Calendar)
    await supabase.from('schedule_items').insert({
      ...scheduleData,
      project_id: determineProjectFromCalendar(calendarId),
      calendar_integration_enabled: true,
    });
  }
}

async function handleEventDeletion(eventId: string) {
  await supabase.from('schedule_items').delete().eq('google_event_id', eventId);
}

function determineProjectFromCalendar(calendarId: string): string {
  // Logic to determine project based on calendar
  // For shared calendars, might need additional context
  return 'default-project-id';
}
```

### Step 3.2: Register Webhooks

```javascript
// tools/register-calendar-webhooks.js
const { google } = require('googleapis');
const crypto = require('crypto');
const serviceAccountAuth = require('../server/server-service-account.cjs');

async function registerWebhooks() {
  await serviceAccountAuth.initialize();
  const auth = await serviceAccountAuth.getClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const webhookUrl = process.env.WEBHOOK_URL;
  const webhookToken = process.env.WEBHOOK_TOKEN;

  const calendars = [
    {
      id: process.env.VITE_GOOGLE_CALENDAR_PROJECTS,
      name: 'Projects Calendar',
    },
    {
      id: process.env.VITE_GOOGLE_CALENDAR_WORK_ORDER,
      name: 'Work Orders Calendar',
    },
  ];

  for (const cal of calendars) {
    if (!cal.id) continue;

    try {
      const channelId = crypto.randomUUID();
      const response = await calendar.events.watch({
        calendarId: cal.id,
        requestBody: {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          token: webhookToken,
          params: {
            ttl: '604800', // 7 days in seconds
          },
        },
      });

      console.log(`✓ Webhook registered for ${cal.name}`);
      console.log(`  Channel ID: ${channelId}`);
      console.log(`  Expiration: ${new Date(parseInt(response.data.expiration))}`);

      // Store webhook details for renewal
      await storeWebhookDetails(cal.id, channelId, response.data.expiration);
    } catch (error) {
      console.error(`✗ Failed to register webhook for ${cal.name}:`, error.message);
    }
  }
}

// Run weekly to renew webhooks before expiration
async function renewWebhooks() {
  // Implementation for webhook renewal
}

if (require.main === module) {
  registerWebhooks().catch(console.error);
}

module.exports = { registerWebhooks, renewWebhooks };
```

## Phase 4: Error Handling & Retry Logic

### Step 4.1: Event Queue for Failures

```javascript
// server-event-queue.cjs
class CalendarEventQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async addToQueue(operation) {
    this.queue.push({
      ...operation,
      attempts: 0,
      createdAt: new Date(),
    });

    if (!this.processing) {
      this.processQueue();
    }
  }

  async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();

      try {
        await this.executeOperation(operation);
      } catch (error) {
        operation.attempts++;

        if (operation.attempts < 3) {
          // Exponential backoff
          const delay = Math.pow(2, operation.attempts) * 1000;
          setTimeout(() => {
            this.queue.push(operation);
          }, delay);
        } else {
          console.error('Operation failed after 3 attempts:', operation);
          await this.logFailedOperation(operation, error);
        }
      }
    }

    this.processing = false;
  }

  async executeOperation(operation) {
    // Execute the calendar operation
  }

  async logFailedOperation(operation, error) {
    // Log to database for manual review
  }
}
```

## Deployment Steps

### 1. Environment Variables

```env
# Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=akc-calendar@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=<base64-encoded-json>

# Shared Calendars
VITE_GOOGLE_CALENDAR_PROJECTS=projects@yourcompany.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=workorders@yourcompany.com

# Webhook
WEBHOOK_URL=https://your-project.supabase.co/functions/v1/calendarWebhook
WEBHOOK_TOKEN=<secure-random-token>
```

### 2. Deployment Order

1. Deploy service account code
2. Grant service account permissions to calendars
3. Deploy webhook function to Supabase
4. Register webhooks
5. Test end-to-end

### 3. Testing Checklist

- [ ] Service account can create events without user login
- [ ] Events sync from app to Google Calendar
- [ ] Events sync from Google Calendar to app
- [ ] Event updates sync both ways
- [ ] Event deletions sync both ways
- [ ] Webhook renewals work
- [ ] Error queue processes failed operations

## Monitoring & Maintenance

### Weekly Tasks

- Check webhook expiration dates
- Review failed operations queue
- Monitor sync performance

### Monthly Tasks

- Audit calendar permissions
- Review service account usage
- Check for API quota limits

This architecture ensures reliability, real-time sync, and proper error handling.
