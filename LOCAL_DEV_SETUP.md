# Local Development Setup Guide

## The Problem

Your Supabase is configured to redirect to the live URL (https://project-crew-connect-dbztoro5pq-ul.a.run.app), but when developing locally, your API calls are trying to hit localhost endpoints. This causes the "Unexpected token '<'" error because the API returns HTML instead of JSON.

## Solution: Separate Development and Production Environments

### 1. Create a `.env.local` file for development

Create a new file `.env.local` in your project root with:

```bash
# Supabase Configuration (same for both environments)
VITE_SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ

# Local Development URLs
VITE_API_BASE_URL=http://localhost:5173
VITE_APP_URL=http://localhost:5173

# Google OAuth
VITE_GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com

# Environment Flag
VITE_ENV=development
```

### 2. Update Supabase Dashboard Settings

**For Local Development:**

1. Go to: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/auth/url-configuration
2. Set Site URL to: `http://localhost:5173`
3. Add to Redirect URLs:
   - `http://localhost:5173/*`
   - `https://project-crew-connect-dbztoro5pq-ul.a.run.app/*`

### 3. Update Google OAuth Console

Add both localhost and production URLs:

1. Go to: https://console.cloud.google.com/apis/credentials?project=crm-live-458710
2. Edit your OAuth 2.0 Client ID
3. Add to Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://project-crew-connect-dbztoro5pq-ul.a.run.app`
4. Add to Authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `https://zrxezqllmpdlhiudutme.supabase.co/auth/v1/callback`

### 4. Run Development Server

```bash
# Make sure you're using the local env file
npm run dev
```

### 5. Production Environment Variables

These are already configured in Google Secret Manager for your Cloud Run deployment:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GOOGLE_CLIENT_ID`
- etc.

## Development Workflow

### Making Changes:

1. **Develop locally** with `npm run dev`
2. **Test** your changes at `http://localhost:5173`
3. **Commit** your changes
4. **Push** to GitHub `main` branch
5. **Automatic deployment** to production

### Testing Production Build Locally:

```bash
npm run build
npm run preview
```

## API Configuration

Your app needs to know which API endpoint to use. Update your API calls to use environment variables:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173';
```

## Quick Checklist

- [ ] Create `.env.local` file
- [ ] Update Supabase URL configuration
- [ ] Update Google OAuth redirect URIs
- [ ] Use environment variables in your code
- [ ] Test locally before pushing to production

## Troubleshooting

If you still get authentication errors:

1. Clear browser cookies/cache
2. Make sure `.env.local` is loaded (restart dev server)
3. Check browser console for specific error messages
4. Verify Supabase and Google OAuth settings match your URLs
