# Root Cause Analysis: Calendar Sync Failure

## Error Timeline

1. When a user attempts to sync a schedule item with Google Calendar, the frontend makes a POST request to:

   ```
   POST /api/schedule-items/{id}/sync-calendar
   ```

2. The request fails with a 500 Internal Server Error

   ```
   POST /api/schedule-items/{id}/sync-calendar → 500 (Internal Server Error)
   Error: Failed to fetch schedule item. DB Error: TypeError: fetch failed
   ```

3. The error occurs in the server-side endpoint that handles calendar synchronization.

## Error Stack Trace

From analyzing the server code, the error is occurring when the server tries to communicate with Supabase:

```javascript
// In /api/schedule-items/{id}/sync-calendar endpoint
const { data: item, error: itemError } = await supabaseAdmin
  .from('schedule_items')
  .select('*')
  .eq('id', itemId)
  .single();

if (itemError) {
  console.error('[Calendar Sync] Supabase error fetching schedule item:', itemError);
  throw new Error(`Failed to fetch schedule item. DB Error: ${itemError.message}`);
}
```

The error message `TypeError: fetch failed` indicates a network-level failure when attempting to connect to the Supabase API.

## Root Causes Identified

After thorough investigation, we identified the following issues:

### Primary Issue: Environment Variable Inconsistency

1. **Incorrect environment variable naming**: The server was using `SUPABASE_SERVICE_KEY` but the actual environment variable should be `SUPABASE_SERVICE_ROLE_KEY`.

   ```javascript
   // Before:
   const supabaseAdmin = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
   );

   // After:
   const supabaseAdmin = createClient(
     process.env.SUPABASE_URL,
     process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
   );
   ```

2. **Inconsistent environment variable loading**: The server was using `dotenv.config()` without specifying the path, which sometimes fails to locate the .env file correctly in the project structure.

   ```javascript
   // Before:
   dotenv.config();

   // After:
   dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
   ```

### Secondary Issues

1. **Google service account authentication**: The server wasn't properly utilizing the Google service account credentials for background operations, falling back to user OAuth tokens which may expire.

2. **Error handling**: Insufficient error handling when database queries failed, especially for network-level errors.

3. **Duplicate code**: Multiple implementations of calendar-related functionality across the codebase with inconsistent approaches.

## Validation

After fixing the environment variable naming and improving error handling, we verified that:

1. The Supabase connection can be established properly
2. The server can fetch schedule items from the database
3. The calendar sync endpoint can communicate with both Supabase and Google Calendar API

## Recommended Actions

1. ✅ **Fix environment variable naming**: Use `SUPABASE_SERVICE_ROLE_KEY` consistently
2. ✅ **Improve environment variable loading**: Specify the path to .env file explicitly
3. ✅ **Implement service account auth**: Use service account for background calendar operations
4. ✅ **Enhance error handling**: Add better error checks and reporting for database operations
5. 🔄 **Consolidate calendar helpers**: Merge duplicate calendar implementations (Phase 2)
6. 🔄 **Add unit tests**: Create tests for calendar sync functionality (Phase 2)

## Conclusion

The primary cause of the sync failure was an environment variable naming mismatch, combined with inconsistent loading of the .env file. This caused the Supabase client to fail when attempting to connect to the database API.

The fix was simple but required careful attention to the environment variable naming conventions and how they're loaded in different parts of the application.
