# Google Calendar Integration - Production Implementation TODO

## Current Issue

The production server (`server-production.cjs`) is missing Google Calendar integration endpoints, causing the frontend to receive HTML error pages instead of JSON responses when trying to connect Google Calendar.

## Error Details

- **Frontend Error**: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`
- **Root Cause**: `/api/auth/status` endpoint doesn't exist in production, returns 404 HTML page
- **Location**: Settings > Google Calendar Integration > "Connect to Google Calendar" button

## Required Endpoints (from development server)

### Authentication Endpoints

- `GET /auth/google` - Initiates OAuth flow
- `GET /auth/google/callback` - Handles OAuth callback
- `GET /api/auth/status` - Checks authentication status
- `POST /api/auth/logout` - Logs out user

### Calendar API Endpoints

- `GET /api/calendar/list` - Lists user's calendars
- `GET /api/calendar/events` - Gets calendar events
- `POST /api/calendar/events` - Creates calendar event
- `PUT /api/calendar/events/:eventId` - Updates calendar event
- `DELETE /api/calendar/events/:eventId` - Deletes calendar event
- `POST /api/calendar/milestones/:milestoneId` - Creates milestone event
- `POST /api/calendar/workorders/:workOrderId` - Creates work order event

## Dependencies Needed

### NPM Packages

```json
{
  "express-session": "^1.18.0",
  "connect-redis": "^7.1.0",
  "googleapis": "^133.0.0",
  "@googlemaps/google-maps-services-js": "^3.4.0"
}
```

### Environment Variables

- `GOOGLE_OAUTH_CLIENT_ID` (already in secrets)
- `GOOGLE_OAUTH_CLIENT_SECRET` (already in secrets)
- `SESSION_SECRET` (needs to be added)
- `REDIS_URL` (for session storage in production)

## Implementation Steps

### 1. Update package.json

Add required dependencies for Google OAuth and session management

### 2. Create server-helpers directory

Copy from development:

- `/server/google-api-helpers/calendar.js`
- `/server/google-api-helpers/drive.js`
- `/server/google-api-helpers/gmail.js`

### 3. Update server-production.cjs

- Add session middleware with Redis store
- Add Google OAuth configuration
- Copy authentication endpoints from server.js
- Copy calendar API endpoints from server.js
- Add requireAuth middleware

### 4. Session Storage Strategy

For production, we need persistent session storage:

- Option A: Redis (recommended for scalability)
- Option B: Database sessions in Supabase
- Option C: JWT tokens (stateless, but more complex)

### 5. Update Cloud Run Configuration

- Add session secret to Secret Manager
- Update deployment to include new environment variables
- Consider adding Redis instance if using Redis sessions

## Temporary Fix (Deployed)

Added stub endpoints to prevent HTML errors:

```javascript
app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: false });
});
```

## Testing Plan

1. Test OAuth flow locally with development server
2. Deploy to staging environment
3. Test complete flow in production
4. Verify calendar events are created correctly

## Security Considerations

- Ensure session cookies are secure and httpOnly
- Validate redirect URLs
- Implement CSRF protection
- Rate limit authentication endpoints

## Estimated Timeline

- [ ] Day 1: Add dependencies and basic auth endpoints
- [ ] Day 2: Implement OAuth flow and session management
- [ ] Day 3: Add calendar API endpoints
- [ ] Day 4: Testing and deployment
- [ ] Day 5: Production verification and monitoring

## Priority Projects

### 1. Payee Selection Schema Fix ✅ SOLUTION CREATED

**Issue**: Subcontractor queries fail with 400 error - `column subcontractors.subname does not exist`

- **Root Cause**: Frontend expects `subname` but database has `company_name`
- **Impact**: 25+ files, 100+ lines of code
- **Solution**: Created migration `supabase/migrations/20250111_add_subname_alias.sql`
- **Status**: Ready to deploy - adds `subname` as generated column alias
- **Documentation**: See `PAYEE_SELECTION_SCHEMA_INVENTORY.md` and `PAYEE_SELECTION_IMPACT_MAP.md`

### 2. Google Calendar Integration
