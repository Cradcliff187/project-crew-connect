# AKC Revisions - Deployment Information

## Live Application

**🚀 Live URL**: https://project-crew-connect-1061142868787.us-east5.run.app

## Cloud Run Details

- **Service Name**: project-crew-connect
- **Region**: us-east5
- **Project ID**: crm-live-458710
- **Status**: ✅ Running

## Environment Configuration

All secrets are stored in Google Secret Manager:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_MAPS_API_KEY
- GOOGLE_PROJECT_CALENDAR_ID
- GOOGLE_WORK_ORDER_CALENDAR_ID
- WEBHOOK_URL

## Deployment Commands

```bash
# View service status
gcloud run services describe project-crew-connect --region us-east5

# View logs
gcloud run logs read --service project-crew-connect --region us-east5 --limit 50

# Update service
gcloud run deploy project-crew-connect --region us-east5 --image IMAGE_URL
```

## CI/CD

- Automatic deployment on push to main branch via Cloud Build
- Dockerfile and cloudbuild.yaml are configured
- GitHub repository: https://github.com/Cradcliff187/project-crew-connect

## Deployment Files

All deployment scripts, guides, and documentation have been organized in the `deployment-files/` directory.

## Quick Reference

- **Deployment Documentation**: See `deployment-files/DOCS_DEPLOY.md`
- **Live App Summary**: See `deployment-files/LIVE_DEPLOYMENT_SUMMARY.md`
- **OAuth Setup**: See `deployment-files/OAUTH_FIX_INSTRUCTIONS.txt`

## Auto-Deployment

This project is configured for automatic deployment:

- Push to `main` branch on GitHub
- Cloud Build automatically builds and deploys to Cloud Run
- Changes are live in ~5 minutes

## Essential Files in Root

- `Dockerfile` - Container configuration
- `cloudbuild.yaml` - Cloud Build configuration
- `server.cjs` - Node.js server
- `.dockerignore` - Docker build exclusions
