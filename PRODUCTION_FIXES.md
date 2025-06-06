# Production Fixes

## Issues Fixed

### 1. Autocomplete API Returning HTML Instead of JSON

**Problem**: The production server (`server.cjs`) was only serving static files and redirecting all routes to `index.html`, including API routes.

**Solution**: Created `server-production.cjs` that:

- Handles API routes for Google Maps autocomplete and place details
- Serves static files
- Routes client-side navigation to index.html
- Uses environment variables for Google Maps API key

### 2. Excessive Authentication Events in Console

**Problem**: Multiple SIGNED_IN events were being logged repeatedly due to:

- Duplicate auth state change listeners (one in `client.ts` and one in `AuthContext.tsx`)
- No deduplication of auth events

**Solution**:

- Removed the auth state change listener from `src/integrations/supabase/client.ts`
- Added event deduplication in `AuthContext.tsx`
- Added debug flag to control auth logging (only logs in development)

## Files Changed

1. **server-production.cjs** (NEW)

   - Production server with API routes and static file serving

2. **Dockerfile**

   - Updated to use Node.js 20 Alpine
   - Multi-stage build for smaller image
   - Uses new production server file

3. **src/integrations/supabase/client.ts**

   - Removed duplicate auth state change listener

4. **src/contexts/AuthContext.tsx**
   - Added event deduplication
   - Added debug logging control
   - Prevents duplicate auth event processing

## Deployment

After merging to main, the changes will automatically deploy via Cloud Build. The production server will now properly handle:

- API requests to `/api/maps/*`
- Static file serving
- Client-side routing

## Environment Variables

The following are already configured in Google Secret Manager:

- `GOOGLE_MAPS_API_KEY` - For Google Maps API calls
- `SUPABASE_*` - Supabase credentials
- `GOOGLE_CLIENT_*` - OAuth credentials
