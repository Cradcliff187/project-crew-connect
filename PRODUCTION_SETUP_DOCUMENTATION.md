# AKC CRM Production Setup Documentation

## Overview

This document provides comprehensive details about the production deployment of the AKC CRM system, including OAuth configuration, Google Cloud setup, and all necessary environment variables.

## Production Deployment

### Google Cloud Project

- **Project ID**: `crm-live-458710`
- **Project Number**: `1061142868787`
- **Service**: Cloud Run
- **Region**: `us-east5`

### Cloud Run Service Details

- **Service Name**: `project-crew-connect`
- **Production URL**: https://project-crew-connect-dbztoro5pq-ul.a.run.app
- **Access**: Public (allUsers have roles/run.invoker)
- **Ingress**: All traffic allowed

## OAuth Configuration

### Google OAuth 2.0 Client

- **Client ID**: `1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com`
- **Client Secret**: Stored in Google Secret Manager as `google-client-secret`
- **OAuth Brand**: "AKC CRM" (restricted to austinkunzconstruction.com domain)
- **Support Email**: cradcliff@austinkunzconstruction.com

### Required Redirect URIs

The following redirect URIs must be configured in the Google Cloud Console OAuth 2.0 Client:

1. `https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/google/callback` (Production)
2. `http://localhost:8080/auth/google/callback` (Local development)
3. `http://localhost:3000/auth/google/callback` (Alternative local development)

### OAuth Scopes

- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/userinfo.email`
- `https://www.googleapis.com/auth/userinfo.profile`

## Environment Variables

### Production Environment Variables (Cloud Run)

```
# Core URLs
GOOGLE_REDIRECT_URI=https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/google/callback
REDIRECT_URI=https://project-crew-connect-dbztoro5pq-ul.a.run.app/auth/google/callback
VITE_API_BASE_URL=https://project-crew-connect-dbztoro5pq-ul.a.run.app/api

# Secrets (stored in Google Secret Manager)
SUPABASE_URL=<secret:supabase-url>
SUPABASE_ANON_KEY=<secret:supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<secret:supabase-service-role-key>
GOOGLE_CLIENT_ID=<from-oauth-client>
GOOGLE_CLIENT_SECRET=<secret:google-client-secret>
GOOGLE_CALENDAR_PROJECT=<secret:google-calendar-project>
GOOGLE_CALENDAR_WORK_ORDER=<secret:google-calendar-work-order>
GOOGLE_MAPS_API_KEY=<secret:google-maps-api-key>
```

### Local Development Environment Variables (.env)

```
# Supabase Configuration
SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
REDIRECT_URI=http://localhost:8080/auth/google/callback

# Google Calendar IDs
GOOGLE_CALENDAR_PROJECT=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
```

## Supabase Configuration

### Supabase Project

- **URL**: https://zrxezqllmpdlhiudutme.supabase.co
- **Project ID**: zrxezqllmpdlhiudutme
- **Features Used**:
  - Authentication (with Google OAuth provider configured)
  - Database (PostgreSQL)
  - Storage (for document uploads)
  - Edge Functions (for webhooks)

### Database Structure

- Session storage for Google OAuth tokens
- Project management tables
- Document management
- Time tracking
- Estimates and work orders

## Server Configuration

### Main Server Files

1. **server.cjs** - Main entry point, loads production server
2. **server-production.cjs** - Production server configuration
3. **server-google-calendar-auth.cjs** - Google OAuth and Calendar API handling
4. **server-supabase-session-store.cjs** - Session storage using Supabase
5. **server-api-endpoints.cjs** - API endpoint definitions
6. **server-body-parser-fix.cjs** - Body parser middleware configuration

### OAuth Flow

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. After authorization, redirected to `/auth/google/callback`
4. Server exchanges code for tokens
5. Tokens stored in Supabase session store
6. User session created with 24-hour expiry

## Deployment Process

### Automatic Deployment via Cloud Build

1. **Trigger**: Push to GitHub repository
2. **Build**: Docker container built using `cloudbuild.yaml`
3. **Deploy**: Container deployed to Cloud Run
4. **URL**: https://project-crew-connect-dbztoro5pq-ul.a.run.app

### Manual Deployment

```bash
# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml --project=crm-live-458710

# Or deploy directly
./deploy-to-production.ps1
```

## Verification and Troubleshooting

### OAuth Verification Script

Use `verify-oauth-configs.ps1` to check:

- Cloud Run service configuration
- Environment variables
- OAuth client setup
- Redirect URI configuration

```powershell
.\verify-oauth-configs.ps1
```

### Quick OAuth Check

Use `check-oauth-simple.ps1` for a quick status check:

```powershell
.\check-oauth-simple.ps1
```

### Common Issues and Solutions

1. **403 Forbidden Error**

   - Ensure Cloud Run service has public access
   - Check IAM policy includes `allUsers` with `roles/run.invoker`

2. **OAuth 403: access_denied**

   - Verify redirect URI is added to OAuth client
   - Check production URL matches exactly
   - Wait 5-10 minutes for Google to propagate changes

3. **Session Issues**

   - Check Supabase connection
   - Verify session table exists
   - Check session cookie settings

4. **Calendar API Errors**
   - Verify OAuth scopes include calendar access
   - Check calendar IDs are correct
   - Ensure user has access to shared calendars

## Security Considerations

1. **Secrets Management**

   - All sensitive data stored in Google Secret Manager
   - Never commit secrets to repository
   - Use `.env` file for local development only

2. **Domain Restrictions**

   - OAuth brand restricted to austinkunzconstruction.com
   - Consider using organization-specific access controls

3. **Session Security**
   - Sessions expire after 24 hours
   - HTTP-only cookies used
   - Secure flag set in production

## Local Development Setup

1. Copy `env-template.txt` to `.env`
2. Fill in required environment variables
3. Run `npm install`
4. Start development server: `npm run dev`
5. Server runs on http://localhost:8080

## Monitoring

- **Cloud Run Logs**: `gcloud run services logs read project-crew-connect --project=crm-live-458710`
- **Build History**: https://console.cloud.google.com/cloud-build/builds?project=crm-live-458710
- **Service Metrics**: https://console.cloud.google.com/run/detail/us-east5/project-crew-connect/metrics?project=crm-live-458710

## Contact

For issues or questions about this deployment:

- **Support Email**: cradcliff@austinkunzconstruction.com
- **Project**: Austin Kunz Construction CRM
