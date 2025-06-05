# 🚀 Deployment Information

## Live Production URL

**https://project-crew-connect-dbztoro5pq-ul.a.run.app**

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
