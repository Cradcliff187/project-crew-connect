# 🚀 Production Deployment Guide

**AKC LLC Application - Google Cloud Deployment**

## 📋 Pre-Deployment Checklist

### ✅ **Environment Files Updated**

- [x] `.env.local` - Updated with Google Maps API key
- [ ] `.env` - Update with same content as `.env.local`
- [x] `app.yaml` - Created for App Engine deployment
- [x] `cloudbuild.yaml` - Created for automated builds

### ✅ **Google Cloud Setup Required**

## 🔧 **Step 1: Update Your .env File**

Copy the content from your `.env.local` to your `.env` file for consistency:

```bash
SERVER_PORT=3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_SCOPES=https://www.googleapis.com/auth/calendar
GOOGLE_APPLICATION_CREDENTIALS=./credentials/calendar-service-account.json

# Google Maps API Key (REQUIRED for address autocomplete)
GOOGLE_MAPS_API_KEY=AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I

# Supabase Configuration
SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY
SUPABASE_PROJECT_ID=zrxezqllmpdlhiudutme

# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
CLIENT_SECRET=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
REDIRECT_URI=http://localhost:8080/auth/google/callback

# Shared Google Calendars
GOOGLE_CALENDAR_PROJECT=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
GOOGLE_CALENDAR_ADHOC=primary

# Webhook Configuration
WEBHOOK_URL=https://zrxezqllmpdlhiudutme.functions.supabase.co/calendarWebhook
```

## 🌐 **Step 2: Google Cloud Project Setup**

### **2.1 Create/Select Google Cloud Project**

```bash
# Install Google Cloud CLI if not already installed
# https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create akc-revisions-prod --name="AKC Revisions Production"

# Set the project
gcloud config set project akc-revisions-prod

# Enable required APIs
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable places-backend.googleapis.com
gcloud services enable maps-backend.googleapis.com
```

### **2.2 Initialize App Engine**

```bash
# Initialize App Engine (choose your preferred region)
gcloud app create --region=us-central1
```

## 🔐 **Step 3: Security Configuration**

### **3.1 Secure Your Google Maps API Key**

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Find your Maps API key: `AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I`
3. Click "Edit" and add restrictions:
   - **Application restrictions:** HTTP referrers
   - **Website restrictions:** Add your production domain:
     ```
     https://your-domain.com/*
     https://*.your-domain.com/*
     ```
   - **API restrictions:** Restrict to:
     - Places API
     - Maps JavaScript API

### **3.2 Update OAuth Redirect URIs**

1. Go to [Google Cloud Console → OAuth 2.0 Client IDs](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth client: `1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com`
3. Add production redirect URIs:
   ```
   https://your-domain.com/auth/google/callback
   https://akc-revisions-dot-your-project-id.uc.r.appspot.com/auth/google/callback
   ```

## 📝 **Step 4: Update Production URLs**

### **4.1 Update app.yaml**

Edit the `app.yaml` file and replace placeholders:

```yaml
# Replace these lines in app.yaml:
GOOGLE_REDIRECT_URI: "https://your-domain.com/auth/google/callback"
VITE_API_BASE_URL: "https://your-domain.com/api"
REDIRECT_URI: "https://your-domain.com/auth/google/callback"

# With your actual domain:
GOOGLE_REDIRECT_URI: "https://akc-revisions-dot-your-project-id.uc.r.appspot.com/auth/google/callback"
VITE_API_BASE_URL: "https://akc-revisions-dot-your-project-id.uc.r.appspot.com/api"
REDIRECT_URI: "https://akc-revisions-dot-your-project-id.uc.r.appspot.com/auth/google/callback"
```

## 🚀 **Step 5: Deploy to Production**

### **5.1 Manual Deployment**

```bash
# Build the application
npm run build

# Deploy to App Engine
gcloud app deploy

# View your deployed application
gcloud app browse
```

### **5.2 Automated Deployment (Recommended)**

#### **Connect GitHub Repository:**

1. Go to [Google Cloud Console → Cloud Build → Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect your GitHub repository
4. Configure trigger:
   - **Name:** `deploy-akc-revisions`
   - **Event:** Push to branch
   - **Branch:** `^main$` (or your production branch)
   - **Configuration:** Cloud Build configuration file
   - **Location:** `cloudbuild.yaml`

#### **Set up automatic deployment:**

```bash
# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Grant Cloud Build permissions to deploy
gcloud projects add-iam-policy-binding your-project-id \
    --member="serviceAccount:your-project-number@cloudbuild.gserviceaccount.com" \
    --role="roles/appengine.deployer"
```

## 🔍 **Step 6: Testing & Verification**

### **6.1 Test Core Functionality**

- [ ] Application loads at production URL
- [ ] Google OAuth login works
- [ ] Google Maps autocomplete works
- [ ] Calendar integration works
- [ ] All modules function properly

### **6.2 Monitor Deployment**

```bash
# View logs
gcloud app logs tail -s default

# Check application status
gcloud app describe

# View metrics
gcloud app browse --service=default
```

## 🛠️ **Step 7: Post-Deployment Configuration**

### **7.1 Custom Domain (Optional)**

```bash
# Map custom domain
gcloud app domain-mappings create your-domain.com

# Update DNS records as instructed
```

### **7.2 SSL Certificate**

Google App Engine automatically provides SSL certificates for custom domains.

## 📊 **Step 8: Monitoring & Maintenance**

### **8.1 Set up Monitoring**

- Enable Google Cloud Monitoring
- Set up alerts for errors and performance
- Monitor API usage and costs

### **8.2 Regular Updates**

```bash
# Update dependencies
npm update

# Redeploy
gcloud app deploy
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Maps API not working:**

   - Check API key restrictions
   - Verify billing is enabled
   - Check API quotas

2. **OAuth errors:**

   - Verify redirect URIs are correct
   - Check OAuth client configuration

3. **Build failures:**
   - Check `cloudbuild.yaml` configuration
   - Verify all dependencies are listed in `package.json`

## 📞 **Support**

If you encounter issues:

1. Check Google Cloud Console logs
2. Review the deployment guide
3. Verify all environment variables are set correctly

---

**🎉 Your AKC LLC application is now ready for production deployment!**
