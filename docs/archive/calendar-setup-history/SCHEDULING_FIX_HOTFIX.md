# Scheduling System Hotfix - Critical Production Issues

## Issues Identified

### 1. Database Column Name Error

**Error**: `column projects.name does not exist`
**Location**: `src/lib/calendarService.ts` line 25
**Cause**: Code was trying to select `name` column but the actual column is `projectname`

### 2. Authentication Error (401)

**Error**: `Failed to create schedule item: {"error":"Authentication required"}`
**Location**: API calls missing authentication credentials
**Cause**: Fetch requests weren't including session cookies

## Fixes Applied

### Fix 1: Database Column Name

Changed the query in `src/lib/calendarService.ts`:

```typescript
// Before:
.select('calendar_id, name')

// After:
.select('calendar_id, projectname')
```

Also updated references from `project.name` to `project.projectname`

### Fix 2: Authentication Credentials

Added `credentials: 'include'` to all fetch requests:

```typescript
const response = await fetch('/api/google/create-calendar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // <-- Added this
  body: JSON.stringify(...)
});
```

## Files Modified

1. **src/lib/calendarService.ts**

   - Fixed column name from `name` to `projectname`
   - Added `credentials: 'include'` to fetch calls

2. **src/services/enhancedCalendarService.ts**
   - Already had `credentials: 'include'` (no change needed)

## Testing Instructions

1. **Test from Scheduling Page**:

   - Open the scheduling page
   - Create a new "Project Schedule Item"
   - Select a project
   - Verify no 401 errors in console
   - Verify no database column errors

2. **Test from Projects Page**:
   - Go to any project
   - Click on the Schedule tab
   - Click "Schedule New"
   - Create a schedule item
   - Verify it saves successfully

## Deployment

```bash
# Add and commit the fix
git add src/lib/calendarService.ts
git commit -m "Hotfix: Fix database column name and add auth credentials

- Fix 'column projects.name does not exist' error by using correct column name 'projectname'
- Add credentials: 'include' to fetch requests to fix 401 authentication errors"

# Push to trigger deployment
git push origin main
```

## Root Cause Analysis

1. **Column Name Issue**: The projects table schema uses `projectname` (one word, lowercase) but the code assumed it was `name`. This is likely due to inconsistent naming conventions in the database schema.

2. **Authentication Issue**: When running in production, the frontend and backend may be on different domains or subdomains. The `credentials: 'include'` flag is required to send cookies cross-origin.

## Prevention

1. Use TypeScript types generated from the database schema to catch column name mismatches
2. Always include `credentials: 'include'` in fetch requests that need authentication
3. Test in a production-like environment before deploying
