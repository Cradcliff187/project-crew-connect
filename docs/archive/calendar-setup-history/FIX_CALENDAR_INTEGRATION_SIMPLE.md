# Simple Fix for Calendar Integration

## Step 1: Update Frontend to Use Existing Environment Variables

The simplest fix is to update the frontend code to match what's already deployed.

### Fix calendarService.ts

Replace these lines:

```typescript
const sharedProjectCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS;
```

With:

```typescript
const sharedProjectCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT;
```

And:

```typescript
const workOrderCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER;
```

Stays the same (this one is already correct).

### Fix enhancedCalendarService.ts

Update all occurrences of `VITE_GOOGLE_CALENDAR_PROJECTS` to `VITE_GOOGLE_CALENDAR_PROJECT`.

## Step 2: Update Vite Config to Pass Backend Variables to Frontend

In `vite.config.ts`, add this to the `defineConfig`:

```typescript
define: {
  'import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT': JSON.stringify(process.env.GOOGLE_CALENDAR_PROJECT),
  'import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER': JSON.stringify(process.env.GOOGLE_CALENDAR_WORK_ORDER),
}
```

## Step 3: Fix Service Account Module

Update `server-service-account.cjs` to also check for `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`:

```javascript
// Option 1: From base64 encoded env var (recommended for production)
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
  // ... existing code ...
}
// Option 1.5: From raw JSON env var (current deployment)
else if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
  console.log('[Service Account] Initializing from JSON environment variable');
  const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS);

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
  // ... existing code ...
}
```

## Step 4: Grant Calendar Permissions

After deployment, run this locally to grant the service account access to your calendars:

```powershell
# Set up environment
$env:GOOGLE_SERVICE_ACCOUNT_EMAIL = "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com"
$env:GOOGLE_APPLICATION_CREDENTIALS = ".\credentials\calendar-service-account.json"
$env:VITE_GOOGLE_CALENDAR_PROJECT = "c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com"
$env:VITE_GOOGLE_CALENDAR_WORK_ORDER = "c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com"

# Run the setup script
node setup-calendar-permissions.js
```

## That's It!

This minimal approach:

- Uses existing secrets (no Google Secret Manager changes needed)
- Makes the frontend work with what's already deployed
- Enables the service account for shared calendar access
- Requires no changes to cloudbuild.yaml

Total files to change: 4

- `src/lib/calendarService.ts`
- `src/services/enhancedCalendarService.ts`
- `vite.config.ts`
- `server-service-account.cjs`
