# Deploying the Calendar Webhook to Google Cloud Functions

This document outlines the steps to deploy the calendar webhook function to Google Cloud Functions when ready.

## Prerequisites

- Google Cloud Platform account with billing enabled
- `gcloud` CLI installed and configured
- Appropriate IAM permissions

## Configuration Steps

1. **Enable Required APIs**

   ```bash
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable cloudscheduler.googleapis.com
   ```

2. **Set Environment Variables**

   ```bash
   export PROJECT_ID=your-gcp-project-id
   export REGION=us-central1
   export FUNCTION_NAME=calendarWebhook
   ```

3. **Deploy the Function**

   ```bash
   # Navigate to the functions directory
   cd supabase/functions

   # Deploy the function
   gcloud functions deploy $FUNCTION_NAME \
     --gen2 \
     --runtime=nodejs18 \
     --region=$REGION \
     --source=. \
     --entry-point=handleWebhook \
     --trigger-http \
     --allow-unauthenticated \
     --set-env-vars="SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co,SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
   ```

4. **Get the Function URL**

   ```bash
   gcloud functions describe $FUNCTION_NAME --region=$REGION --format="value(url)"
   ```

5. **Configure Google Calendar Push Notifications**

   Use the function URL to set up push notification channels in Google Calendar:

   ```javascript
   // Example code to set up a notification channel
   const calendar = google.calendar({ version: 'v3', auth });
   const response = await calendar.events.watch({
     calendarId: 'primary',
     requestBody: {
       id: uuidv4(), // Generate a unique ID
       type: 'web_hook',
       address: 'https://your-function-url',
       token: 'your-verification-token', // For verification
       expiration: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
     },
   });
   ```

## Security Considerations

1. **Secure the Function Endpoint**

   While we allow unauthenticated access to support Google's webhook notifications, we validate:

   - Google webhook headers (`X-Goog-Channel-*`)
   - Channel ID against stored values

2. **Secret Management**

   Store sensitive keys in Secret Manager:

   ```bash
   # Create a secret
   gcloud secrets create supabase-service-key --replication-policy="automatic"

   # Add the version
   echo -n "your-service-role-key" | gcloud secrets versions add supabase-service-key --data-file=-

   # Grant the function access
   gcloud secrets add-iam-policy-binding supabase-service-key \
     --member=serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com \
     --role=roles/secretmanager.secretAccessor
   ```

   Then update the function to use Secret Manager:

   ```bash
   gcloud functions deploy $FUNCTION_NAME \
     --update-env-vars="SUPABASE_URL=https://zrxezqllmpdlhiudutme.supabase.co" \
     --set-secrets="SUPABASE_SERVICE_ROLE_KEY=supabase-service-key:latest"
   ```

## Monitoring and Logging

1. **View Logs**

   ```bash
   gcloud functions logs read $FUNCTION_NAME --region=$REGION
   ```

2. **Set Up Monitoring Alerts**

   Create alerts for error conditions:

   - Go to GCP Console > Monitoring > Alerting
   - Create a new alert policy on log entries matching "Error processing webhook"

## Renewal of Notification Channels

Calendar notification channels expire after 7 days by default. Set up a Cloud Scheduler job to renew them:

```bash
# Create a scheduler job
gcloud scheduler jobs create http renew-calendar-channels \
  --schedule="0 0 * * *" \
  --uri="https://your-service-url/renew-channels" \
  --http-method=POST \
  --headers="Authorization=Bearer your-auth-token"
```

## Troubleshooting

If webhook notifications aren't being received:

1. Check the function logs for errors
2. Verify the channel hasn't expired
3. Ensure the Google Calendar API has been properly configured
4. Test with a manual webhook simulation:

   ```bash
   curl -X POST https://your-function-url \
     -H "X-Goog-Channel-ID: test-channel-id" \
     -H "X-Goog-Resource-ID: test-resource-id" \
     -H "X-Goog-Resource-State: exists" \
     -H "Content-Type: application/json"
   ```
