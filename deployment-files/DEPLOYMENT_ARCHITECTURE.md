# AKC LLC CRM - Deployment Architecture & API Documentation

## 🏗️ Production Architecture

### Infrastructure

- **Platform**: Google Cloud Platform (GCP)
- **Service**: Cloud Run (us-east5)
- **Container**: Docker (Node.js 20-alpine)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth + Google OAuth

### URLs

- **Production**: https://project-crew-connect-dbztoro5pq-ul.a.run.app
- **GCP Project**: crm-live-458710
- **Supabase Project**: zrxezqllmpdlhiudutme

## 📡 API Endpoints

### ✅ Currently Implemented (Working)

#### Health Check

- `GET /health` - Service health status

#### Google Maps Integration

- `GET /api/maps/autocomplete` - Address autocomplete
- `GET /api/maps/placedetails` - Place details lookup

#### Google Calendar Authentication

- `GET /auth/google` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth callback
- `GET /api/auth/status` - Check auth status
- `POST /api/auth/logout` - Logout

#### Google Calendar Operations

- `GET /api/calendar/list` - List user's calendars
- `GET /api/calendar/events` - Get calendar events
- `POST /api/calendar/events` - Create calendar event
- `PUT /api/calendar/events/:eventId` - Update event
- `DELETE /api/calendar/events/:eventId` - Delete event
- `POST /api/schedule-items/:itemId/sync-calendar` - Sync schedule item

### ❌ Missing Endpoints (Causing 501 Errors)

These endpoints are referenced in the frontend but not implemented in server-production.cjs:

#### OCR/Receipt Processing

- `POST /api/ocr/process-receipt` - Process receipt image with OCR

#### Project Management

- `GET /api/projects` - List projects
- `GET /api/work-orders` - List work orders

#### Calendar Entity Events

- `POST /api/calendar/milestones/:milestoneId` - Create milestone event
- `POST /api/calendar/workorders/:workOrderId` - Create work order event
- `POST /api/calendar/contacts/meetings/:interactionId` - Create meeting event
- `POST /api/calendar/timeentries/:timeEntryId` - Create time entry event

#### Calendar Configuration

- `GET /api/calendar/config` - Get calendar configuration
- `POST /api/calendar/invites` - Send calendar invites

#### Assignee Management

- `GET /api/assignees/:type/:id/email` - Get assignee email

## 🔧 Common Issues & Solutions

### Issue 1: Hardcoded localhost URLs

**Problem**: Frontend had hardcoded `http://localhost:3000` URLs
**Solution**: Changed to relative URLs (`/api/...`)

### Issue 2: Missing API Endpoints

**Problem**: Frontend calls endpoints that don't exist on server
**Solution**: Need to implement missing endpoints or use Supabase client

### Issue 3: Authentication State

**Problem**: Multiple auth listeners causing duplicate events
**Solution**: Removed duplicate listener, added deduplication

## 🚀 Deployment Process

### Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env

# Run development server
npm run dev
```

### Production Deployment

```bash
# Using the deployment script
./deploy-correct.ps1

# Or manually
gcloud builds submit --config cloudbuild.yaml
```

### Environment Variables Required

- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth redirect URI
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `PORT` - Server port (default: 8080)

## 📊 Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Browser       │────▶│   Cloud Run      │────▶│   Supabase      │
│                 │     │                  │     │                 │
│ - React (Vite) │     │ - Express.js     │     │ - PostgreSQL    │
│ - TypeScript    │     │ - Node.js 20     │     │ - Auth          │
│                 │     │ - Docker         │     │ - Storage       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         │                       │                         │
         ▼                       ▼                         │
┌─────────────────┐     ┌──────────────────┐             │
│  Google Maps    │     │  Google Calendar │             │
│     API         │     │      API         │             │
└─────────────────┘     └──────────────────┘             │
                                                          │
                              ┌──────────────────┐        │
                              │  Google OAuth    │────────┘
                              │    Service       │
                              └──────────────────┘
```

## 🔍 Debugging Commands

### Check Service Status

```bash
gcloud run services describe project-crew-connect \
  --region us-east5 \
  --format="get(status.url,status.conditions[0])"
```

### View Logs

```bash
gcloud logging read \
  "resource.type=cloud_run_revision AND \
   resource.labels.service_name=project-crew-connect" \
  --limit=20
```

### Test Endpoints

```bash
# Health check
curl https://project-crew-connect-dbztoro5pq-ul.a.run.app/health

# Autocomplete API
curl "https://project-crew-connect-dbztoro5pq-ul.a.run.app/api/maps/autocomplete?input=123+Main"
```

## 📝 Next Steps

1. **Implement Missing Endpoints**: Add the missing API endpoints to server-production.cjs
2. **Database Integration**: Connect API endpoints to Supabase database
3. **Error Monitoring**: Set up proper error logging and monitoring
4. **Performance**: Add caching for frequently accessed data
5. **Security**: Implement proper authentication checks on all endpoints
