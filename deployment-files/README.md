# Deployment Files

This directory contains all deployment-related scripts and documentation for the AKC Revisions project.

## 📚 Documentation

- **DOCS_DEPLOY.md** - Main deployment documentation
- **LIVE_DEPLOYMENT_SUMMARY.md** - Summary of the live deployment
- **CLOUD_RUN_DEPLOYMENT_GUIDE.md** - Google Cloud Run deployment guide
- **PRODUCTION_DEPLOYMENT_GUIDE.md** - Production deployment procedures
- **TRIGGER_SETUP_GUIDE.md** - Cloud Build trigger setup guide
- **OAUTH_FIX_INSTRUCTIONS.txt** - OAuth configuration instructions
- **FIX_OAUTH_REDIRECT.md** - OAuth redirect troubleshooting

## 🛠️ Setup Scripts

- **setup-deployment.ps1** - Main deployment setup script
- **setup-deployment-continued.ps1** - Continuation of deployment setup
- **setup-secrets.ps1** - Script to set up Google Secret Manager
- **run-complete-setup.ps1** - Complete setup automation

## 🔄 Trigger Scripts

- **create-build-trigger.ps1** - Create Cloud Build trigger
- **setup-github-trigger.ps1** - Setup GitHub integration
- **trigger-setup.ps1** - Trigger configuration
- **setup-trigger-simple.ps1** - Simplified trigger setup

## ✅ Validation Scripts

- **validate-deployment.ps1** - Validate deployment configuration
- **validate-simple.ps1** - Simple validation checks
- **check-deployment-status.ps1** - Check deployment status

## 🚀 Utility Scripts

- **deploy.ps1** - Manual deployment script
- **launch-app.ps1** - Launch app with authentication proxy
- **fix-deployment-permissions.ps1** - Fix permission issues
- **fix-deployment-step-by-step.ps1** - Step-by-step permission fixes

## Production Details

- **Live URL**: https://project-crew-connect-dbztoro5pq-ul.a.run.app
- **Project ID**: crm-live-458710
- **Region**: us-east5
- **Service Name**: project-crew-connect

All scripts are PowerShell (.ps1) and designed for Windows environments.
