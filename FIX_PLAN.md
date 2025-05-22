# Calendar Sync Fix Plan

## Summary of Issues

1. Supabase connection is failing in the calendar sync endpoint
2. Environment variable inconsistency between configuration files
3. Duplicate calendar service implementations (frontend & backend)
4. Lack of clear error handling and logging

## Proposed Code Changes

### 1. Fix Supabase Connection Issues

#### A. Update Environment Variable Naming

**File: server/server.js**

```diff
// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://dxmvqbeyhfnqczvlfnfn.supabase.co',
- process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
+ process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// --- Helper Modules ---
```

#### B. Update server-env.txt to Match Template

**File: server-env.txt**

```diff
# Supabase Configuration
SUPABASE_URL=https://dxmvqbeyhfnqczvlfnfn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXZxYmV5aGZucWN6dmxmbmZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4ODkxMzQsImV4cCI6MjAyOTQ2NTEzNH0.cPitTJCKat0u-Ho0w6KUV4ijXQc2ptE-UJvODPJLKQE
- SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXZxYmV5aGZucWN6dmxmbmZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzg4OTEzNCwiZXhwIjoyMDI5NDY1MTM0fQ.LUcQlPH9-9jijjL916RnFnHQlYB10ToLHvHHBUVIHpM
+ SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4bXZxYmV5aGZucWN6dmxmbmZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMzg4OTEzNCwiZXhwIjoyMDI5NDY1MTM0fQ.LUcQlPH9-9jijjL916RnFnHQlYB10ToLHvHHBUVIHpM
```

#### C. Add Connection Error Handling in Supabase Client Initialization

**File: server/server.js**

```diff
// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://dxmvqbeyhfnqczvlfnfn.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// Verify Supabase connection on startup
(async () => {
  try {
    const { data, error } = await supabaseAdmin.from('schedule_items').select('count').limit(1);
    if (error) {
      console.error('CRITICAL: Supabase connection verification failed:', error);
    } else {
      console.log('Supabase connection verified successfully');
    }
  } catch (err) {
    console.error('CRITICAL: Supabase client initialization error:', err);
  }
})();

// --- Helper Modules ---
```

### 2. Improve Error Handling in Calendar Sync Endpoint

**File: server/server.js**

```diff
app.post('/api/schedule-items/:itemId/sync-calendar', requireAuth, async (req, res) => {
  const { itemId } = req.params;
  console.log(`[Calendar Sync] Received request for schedule item ID: ${itemId}`);

  try {
    // Verify supabaseAdmin is initialized
    if (!supabaseAdmin) {
      throw new Error('Supabase client not initialized - check environment variables');
    }

    // 1. Fetch the schedule item from Supabase
    let item, itemError;
    try {
      const { data: item, error: itemError } = await supabaseAdmin
        .from('schedule_items')
        .select('*')
        .eq('id', itemId)
        .single();
    } catch (fetchError) {
      console.error('[Calendar Sync] Exception during Supabase fetch:', fetchError);
      throw new Error(`Database connection error: ${fetchError.message}`);
    }

    if (itemError) {
      console.error('[Calendar Sync] Supabase error fetching schedule item:', itemError); // Log the full error object
      throw new Error(`Failed to fetch schedule item. DB Error: ${itemError.message}`);
    }
    if (!item) {
      console.error(`[Calendar Sync] Schedule item with ID ${itemId} not found.`);
      throw new Error('Schedule item not found.');
    }

    // Rest of function remains the same...
```

### 3. Standardize Calendar Integration

#### A. Consolidate Calendar Services

1. Create a unified calendar service module in `server/services/calendar-service.js`
2. Move shared functionality from frontend `calendarService.ts` and server `google-api-helpers/calendar.js`
3. Update imports to use the new consolidated service

#### B. Improve Data Types and Validation

Create a TypeScript definition file for calendar operations:

**File: src/types/calendar.d.ts**

```typescript
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  location?: string;
  attendees?: Array<{ email: string; name?: string }>;
  calendar_id?: string;
  entity_type?: string;
  entity_id?: string;
}

export interface CalendarSyncResponse {
  success: boolean;
  event_id?: string;
  error?: string;
  details?: any;
}
```

### 4. Add Logging and Monitoring

**File: server/server.js**

```diff
// Add near the top of the file
const fs = require('fs');
const path = require('path');

// Configure logging
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logCalendarSync = (message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    ...data
  };
  console.log(`[Calendar Sync] ${message}`, data);

  // Append to log file
  fs.appendFileSync(
    path.join(logDir, 'calendar-sync.log'),
    JSON.stringify(logEntry) + '\n'
  );
};
```

Update logging in the sync endpoint:

```diff
app.post('/api/schedule-items/:itemId/sync-calendar', requireAuth, async (req, res) => {
  const { itemId } = req.params;
  logCalendarSync(`Received request for schedule item ID: ${itemId}`, { itemId, user: req.userEmail });
```

## Testing & Verification Plan

1. **Unit Tests**:

   - Add tests for Supabase client initialization
   - Add tests for calendar sync endpoint with mocked Supabase responses

2. **Integration Tests**:

   - Test end-to-end flow with actual Google Calendar API (in dev environment)
   - Verify sync works with different schedule item configurations

3. **Manual Testing Checklist**:
   - [ ] Verify environment variables are correctly set
   - [ ] Confirm Supabase connection is working
   - [ ] Create new schedule item with calendar integration
   - [ ] Update existing schedule item and verify calendar sync
   - [ ] Test with attendees to verify invites are sent
   - [ ] Verify logging is capturing events properly

## Schema Migration (None Required)

The current issue doesn't require any schema changes. The problem is with the connection to the database, not the structure of the database itself.

## Rollout Plan

1. Apply environment variable fixes first (lowest risk)
2. Deploy improved error handling
3. Add logging and monitoring
4. Standardize calendar integration (larger change, should be done last)

## Rollback Plan

1. Keep copies of all original files before modifications
2. Test each change in development before pushing to production
3. If issues arise, revert to the previous version of the affected files
4. Document any issues encountered during rollout for future improvements

## Future Improvements

1. Add more comprehensive monitoring for calendar sync operations
2. Create admin dashboard for viewing sync status
3. Implement better recovery mechanisms for failed syncs
4. Add user notification system for sync failures
5. Improve documentation of calendar integration
