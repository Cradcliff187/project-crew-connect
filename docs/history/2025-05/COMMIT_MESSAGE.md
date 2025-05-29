fix: calendar sync fixes and code cleanup

This commit fixes critical issues with the calendar sync functionality:

1. Environment Variable Loading:

   - Fixed path to load `.env.local` from project root correctly
   - Enforced use of SUPABASE_SERVICE_ROLE_KEY (correct naming)
   - Added validation of required environment variables

2. Service Account Authentication:

   - Properly implemented Google service account auth for calendar operations
   - Fixed credential path resolution

3. Security & Cleanup:

   - Removed all hardcoded keys and calendar IDs
   - Deleted temporary test files and scripts
   - Verified that credentials/ is properly excluded from git

4. Documentation:
   - Updated RCA.md with findings and test evidence
   - Reorganized RLS_CHECK.md for clarity

The database connection now works correctly, allowing schedule items to be queried.
Service account credential format still needs to be fixed in Phase 2.

Next steps (Phase 2):

- Fix service account credentials format
- Consolidate duplicate calendar code
- Implement RLS policies to restrict anonymous access
- Add comprehensive tests for calendar functionality
