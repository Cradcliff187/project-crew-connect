# Cloud Run Deployment Guide

## 🚀 Deployment Overview

This guide explains how to deploy your AKC Revisions CRM application to Google Cloud Run using the repository-based deployment approach.

## 📋 Prerequisites

1. **Google Cloud Project** - Ensure you have a Google Cloud project set up
2. **Cloud Run API** - Enable Cloud Run API in your project
3. **Cloud Build API** - Enable Cloud Build API for automated builds
4. **Container Registry API** - Enable for storing Docker images
5. **Repository Connected** - Your GitHub repository should be connected to Cloud Build

## 🔧 What Was Fixed

The deployment was failing because:

1. **Missing Dockerfile** - Added production Dockerfile for containerization
2. **Wrong Build Configuration** - Updated `cloudbuild.yaml` from App Engine to Cloud Run
3. **No Static File Serving** - Added Express middleware to serve built frontend files
4. **Port Configuration** - Updated server to use Cloud Run's PORT environment variable

## 📁 Files Added/Modified

### New Files:

- `Dockerfile` - Containerizes the full-stack application
- `.dockerignore` - Optimizes Docker build process
- `CLOUD_RUN_DEPLOYMENT_GUIDE.md` - This deployment guide

### Modified Files:

- `cloudbuild.yaml` - Updated for Cloud Run deployment with environment variables
- `server/server.js` - Added static file serving and health check endpoint

## 🚀 Deployment Steps

### 1. Push to Main Branch

```bash
git add .
git commit -m "Configure Cloud Run deployment"
git push origin main
```

### 2. Trigger Cloud Build

The deployment will automatically trigger when you push to the main branch. You can also manually trigger it from the Google Cloud Console.

### 3. Monitor Build Progress

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Cloud Build > History**
3. Watch the build progress in real-time

### 4. Verify Deployment

Once deployed, your application will be available at:

```
https://project-crew-connect-[PROJECT-ID]-[REGION].a.run.app
```

## 🔧 Configuration Details

### Environment Variables

The following environment variables are automatically set during deployment:

- `NODE_ENV=production`
- `PORT=8080` (Cloud Run standard)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- Calendar and webhook configurations

### Port Configuration

- **Container Port**: 8080 (Cloud Run standard)
- **Health Check**: `/health` endpoint added
- **Static Files**: Served from `/dist` directory
- **SPA Routing**: Catch-all handler for React Router

## ⚡ Key Features

1. **Full-Stack Deployment** - Frontend and backend in single container
2. **Production Optimized** - Vite build with optimizations
3. **Health Checks** - Automatic health monitoring
4. **Auto-scaling** - Scales from 0 to 10 instances based on traffic
5. **Environment Variables** - Secure configuration management

## 🔍 Troubleshooting

### Common Issues:

1. **Build Timeouts**

   - Increase timeout in `cloudbuild.yaml` (currently 20 minutes)
   - Use smaller Docker images or multi-stage builds

2. **Port Issues**

   - Ensure server listens on `process.env.PORT`
   - Cloud Run expects port 8080

3. **Static File Issues**

   - Verify `dist` folder is created during build
   - Check Express static middleware configuration

4. **Environment Variables**
   - Verify all required variables are set in `cloudbuild.yaml`
   - Check Google OAuth redirect URIs match deployed URL

### Build Logs

Monitor build logs in Cloud Build console for specific error details.

## 🔄 Updates and Redeployment

To update your application:

1. Make changes to your code
2. Commit and push to main branch
3. Cloud Build will automatically redeploy

## 📊 Resource Configuration

- **CPU**: 2 vCPU
- **Memory**: 2 GB
- **Max Instances**: 10
- **Region**: us-east5 (configurable in `cloudbuild.yaml`)

## 🔐 Security Notes

- Google OAuth credentials are included in deployment
- Supabase keys are configured for production
- Consider using Google Secret Manager for sensitive data in production

## 🎯 Next Steps

1. **Custom Domain** - Set up custom domain for production
2. **HTTPS Certificates** - Automatic with Cloud Run
3. **Monitoring** - Set up Cloud Monitoring and Logging
4. **Google OAuth** - Update redirect URIs to production URL
5. **Database Migration** - Ensure Supabase is production-ready

Your application should now deploy successfully to Cloud Run! 🎉
