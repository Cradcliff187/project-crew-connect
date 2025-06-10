# Calendar Implementation Gaps

## Current State vs. Desired State

### 1. Service Account Not Used ❌

**Current**: User OAuth tokens (requires user to be logged in)
**Desired**: Service account for shared calendars
**Why**: Service account can create events without user login, better for background jobs

### 2. No Two-Way Sync ❌

**Current**: One-way sync (App → Google Calendar)
**Desired**: Two-way sync with webhooks
**Missing**:

- Calendar webhook endpoint (`/supabase/functions/calendarWebhook`)
- Webhook registration script
- Sync logic to update app when calendar changes

### 3. Limited Error Handling ⚠️

**Current**: Events fail silently if user not authenticated
**Desired**: Fallback to service account, queue for retry

## Implementation Plan

### Phase 1: Enable Service Account for Shared Calendars

```javascript
// In server-google-calendar-auth.cjs
// Change this logic:
const authClient =
  calendarId !== 'primary' && serviceAccountAuth
    ? await serviceAccountAuth.getClient()
    : req.googleClient;

// To this:
const sharedCalendarIds = [
  process.env.GOOGLE_CALENDAR_PROJECTS,
  process.env.GOOGLE_CALENDAR_WORK_ORDER,
];

const authClient =
  sharedCalendarIds.includes(calendarId) && serviceAccountAuth
    ? await serviceAccountAuth.getClient()
    : req.googleClient;
```

### Phase 2: Create Calendar Webhook

```typescript
// supabase/functions/calendarWebhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async req => {
  const { resourceId, calendarId, eventId } = await req.json();

  // 1. Fetch updated event from Google Calendar
  // 2. Find corresponding schedule_item by google_event_id
  // 3. Update schedule_item with new data
  // 4. Handle deletions, modifications, etc.
});
```

### Phase 3: Register Webhooks

```javascript
// tools/calendar/webhooks/register-calendar-webhook.js
const { google } = require('googleapis');

async function registerWebhook(calendarId) {
  const calendar = google.calendar('v3');

  await calendar.events.watch({
    calendarId,
    requestBody: {
      id: crypto.randomUUID(),
      type: 'web_hook',
      address: process.env.WEBHOOK_URL,
      token: process.env.WEBHOOK_TOKEN,
      expiration: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  });
}
```

## Environment Variables Needed

```env
# Service Account (for server-side calendar operations)
GOOGLE_SERVICE_ACCOUNT_KEY=<base64-encoded-service-account-json>
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@project.iam.gserviceaccount.com

# Webhook Configuration
WEBHOOK_URL=https://your-project.supabase.co/functions/v1/calendarWebhook
WEBHOOK_TOKEN=<secure-random-token>

# Shared Calendar IDs
GOOGLE_CALENDAR_PROJECTS=projects@yourcompany.com
GOOGLE_CALENDAR_WORK_ORDER=workorders@yourcompany.com
```

## Benefits of Full Implementation

1. **Reliability**: Events created even if user logged out
2. **Real-time Sync**: Changes in Google Calendar reflect in app
3. **Conflict Resolution**: Handle concurrent edits
4. **Offline Support**: Queue events when offline
5. **Audit Trail**: Track all calendar operations

## Quick Win: Enable Service Account Now

The fastest improvement is to enable service account for shared calendars:

1. Add service account credentials to environment
2. Update authentication logic to use service account for shared calendars
3. Test with logged-out users

This would at least ensure calendar events are created reliably without depending on user sessions.
