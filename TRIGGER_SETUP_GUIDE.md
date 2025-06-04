# Quick Trigger Setup Guide (2 minutes)

## Step 1: Open Cloud Build Triggers

Click this link: https://console.cloud.google.com/cloud-build/triggers?project=crm-live-458710

## Step 2: Click "CREATE TRIGGER"

It's a blue button at the top of the page

## Step 3: Fill in these exact values:

### Basic Information

- **Name**: `deploy-main-to-cloud-run`
- **Description**: `Deploy main branch to Cloud Run`

### Event

- Select: **Push to a branch**

### Source

- **Repository**: Click the dropdown and select `Cradcliff187/project-crew-connect (2nd gen)`
- **Branch**: Type exactly: `^main$`

### Configuration

- **Type**: Select "Cloud Build configuration file (yaml or json)"
- **Location**: Type exactly: `/cloudbuild.yaml`

## Step 4: Click "CREATE"

The blue button at the bottom

## That's it! 🎉

Your trigger is now created and will automatically deploy when you push to main.

## Test Your Deployment

Run these commands:

```bash
git rm cloudbuild.yaml
git mv cloudbuild-secure.yaml cloudbuild.yaml
git add .
git commit -m "Setup secure Cloud Build configuration"
git push origin main
```

Then watch your build at:
https://console.cloud.google.com/cloud-build/builds?project=crm-live-458710
