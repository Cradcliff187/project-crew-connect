# Development Workflow Guide

## 🔧 Initial Setup for Local Development

### 1. Run the Setup Script

```powershell
.\setup-local-dev.ps1
```

This creates:

- `.env` file with local development settings
- `server/.env` file for backend configuration

### 2. Configure External Services

#### Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme/auth/url-configuration
2. Update settings:
   - **Site URL**: `http://localhost:5173` (for local dev)
   - **Redirect URLs**: Add both:
     - `http://localhost:5173/*`
     - `https://project-crew-connect-dbztoro5pq-ul.a.run.app/*`

#### Google OAuth Console

1. Go to: https://console.cloud.google.com/apis/credentials?project=crm-live-458710
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `https://project-crew-connect-dbztoro5pq-ul.a.run.app`
4. Add to **Authorized redirect URIs**:
   - `http://localhost:5173/auth/callback`
   - `https://zrxezqllmpdlhiudutme.supabase.co/auth/v1/callback`

## 🚀 Development Commands

### Start Local Development

```bash
# Run both frontend and backend servers
npm run dev:all

# Or run them separately in different terminals:
# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Express)
npm run server
```

### Your app will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## 📝 Making Changes

### 1. Develop Locally

- Make your code changes
- Test at http://localhost:5173
- The frontend hot-reloads automatically
- Backend requires restart if you change server files

### 2. Test Your Changes

- Test authentication flow
- Test API calls (autocomplete, etc.)
- Check browser console for errors

### 3. Commit and Deploy

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: Add new feature"

# Push to trigger deployment
git push origin main
```

### 4. Automatic Deployment

- Push to `main` triggers Cloud Build
- Wait ~5 minutes for deployment
- Check live site: https://project-crew-connect-dbztoro5pq-ul.a.run.app

## 🐛 Troubleshooting

### "Unexpected token '<'" Error

- **Cause**: Backend server not running
- **Fix**: Run `npm run dev:all` to start both servers

### Authentication Issues

- Clear browser cookies/cache
- Check Supabase URL configuration
- Verify Google OAuth settings
- Make sure `.env` file exists

### API Calls Failing

- Check backend server is running (port 3000)
- Verify environment variables are loaded
- Check browser network tab for actual errors

## 🔄 Environment Variables

### Local Development (.env)

```bash
VITE_SUPABASE_URL=https://...
VITE_API_BASE_URL=http://localhost:5173
VITE_APP_URL=http://localhost:5173
```

### Production (Google Secret Manager)

- Automatically injected by Cloud Run
- No need to manage manually
- Different URLs for production

## 📦 Building for Production

### Test Production Build Locally

```bash
# Build the app
npm run build

# Preview the build
npm run preview
```

### Deploy to Production

```bash
# Just push to main branch
git push origin main
```

## 🎯 Best Practices

1. **Always test locally** before pushing
2. **Use environment variables** for configuration
3. **Never commit .env files** (they're gitignored)
4. **Check browser console** for errors
5. **Monitor Cloud Build** after pushing

## 🆘 Common Issues

### Port Already in Use

```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found

```bash
# Reinstall dependencies
npm install
```

### Build Failures

- Check Cloud Build logs
- Verify all environment variables
- Test build locally first

## 📚 Resources

- **Live App**: https://project-crew-connect-dbztoro5pq-ul.a.run.app
- **Cloud Build**: https://console.cloud.google.com/cloud-build/builds?project=crm-live-458710
- **Supabase**: https://supabase.com/dashboard/project/zrxezqllmpdlhiudutme
- **GitHub**: https://github.com/Cradcliff187/project-crew-connect
