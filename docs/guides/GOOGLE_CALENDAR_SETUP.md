# Google Calendar Setup & Troubleshooting Guide

This guide details setting up Google Calendar integration for the AKC Revisions project, focusing on service accounts, API access, and webhook management.

## 1. Prerequisites

- Google Cloud Platform (GCP) project.
- Node.js and npm installed.
- Supabase project initialized.
- Project cloned locally.

## 2. Google Cloud Platform Setup

### 2.1. Enable Google Calendar API

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Select your project.
3.  Navigate to "APIs & Services" > "Library".
4.  Search for "Google Calendar API" and enable it.

### 2.2. Create Service Account

1.  Navigate to "IAM & Admin" > "Service Accounts".
2.  Click "+ CREATE SERVICE ACCOUNT".
3.  Fill in details (e.g., `calendar-sync-bot`).
4.  Grant necessary roles (e.g., "Service Account User" for basic access, specific Calendar roles might be needed depending on operations).
5.  Click "DONE".
6.  Find the created service account, click the three dots (Actions) > "Manage keys".
7.  Click "ADD KEY" > "Create new key".
8.  Choose "JSON" and click "CREATE". A JSON key file will be downloaded.
9.  **IMPORTANT**: Rename this file to `calendar-service-account.json` and place it in the `./credentials/` directory of your project. **Do not commit this file to Git if it contains sensitive keys (ensure `.credentials/` is in `.gitignore` if not already).**

### 2.3. Share Calendars with Service Account

For each Google Calendar you want the application to access (e.g., Projects Calendar, Work Orders Calendar):

1.  Open Google Calendar settings for that calendar.
2.  Go to "Share with specific people or groups".
3.  Add the service account's email address (e.g., `calendar-sync-bot@<your-gcp-project-id>.iam.gserviceaccount.com`).
4.  Grant appropriate permissions (e.g., "Make changes to events" or "See all event details").

## 3. Project Environment Setup

1.  **Create `.env` file:**
    If you don't have an `.env` file, create one by running the setup script from the project root:
    ```powershell
    powershell -File tools/setup/create-env.ps1 # UPDATED PATH
    ```
    Ensure it contains your Supabase credentials and the correct Google Calendar IDs:
    ```env
    # ... other vars
    GOOGLE_APPLICATION_CREDENTIALS=./credentials/calendar-service-account.json
    PROJECTS_CALENDAR_ID=your_project_calendar_id@group.calendar.google.com
    WORKORDERS_CALENDAR_ID=your_workorder_calendar_id@group.calendar.google.com
    # ... other OAuth vars if using user-level OAuth for other features
    ```

## 4. Running Calendar-Related Scripts

Several scripts are available in `tools/calendar/` and `tests/calendar/`.

- **Register Webhooks:**
  To initiate event listening from Google Calendar to your Supabase function:
  ```bash
  node tools/calendar/webhooks/register-calendar-webhook.cjs # UPDATED PATH
  ```
- **Renew Webhooks (Scheduled Task):**
  Webhooks expire. Set up a scheduled task (e.g., daily) to run:
  `tools/calendar/webhooks/scheduled-webhook-renewal.cjs` # UPDATED PATH
  You can use `tools/setup/setup-renewal-task.ps1` or `tools/setup/setup-user-task.bat` to help create this task on Windows.

- **Testing Calendar Integration:**
  Run tests from the `tests/calendar/` directory, e.g.:
  ```bash
  node tests/calendar/test-calendar-integration.js
  node tests/calendar/direct-calendar-test.cjs
  ```

## 5. Supabase Webhook Function

- Ensure your Supabase Edge Function (e.g., `supabase/functions/calendarWebhook/index.ts`) is deployed and correctly configured to handle incoming notifications from Google Calendar.
- The URL for this function is used when registering webhooks.

## 6. Troubleshooting

- **`PERMISSION_DENIED` or 403 Errors:**
  - Service account doesn't have API enabled in GCP.
  - Service account doesn't have access to the specific calendar (check sharing settings).
  - Incorrect `GOOGLE_APPLICATION_CREDENTIALS` path or invalid JSON file.
- **Webhook Issues:**
  - Webhook not registered or expired: Rerun `register-calendar-webhook.cjs`.
  - Supabase function URL incorrect or function has errors: Check Supabase logs.
  - Firewall or network issues preventing Google from reaching your webhook URL (less common with Supabase Functions but possible if self-hosting the endpoint).
- **Environment Variables:** Double-check all calendar IDs and Supabase URLs/keys in your `.env` file.
- **Script Paths:** Ensure you are running Node.js scripts from the project root directory, or adjust relative paths within scripts if running from subdirectories.

This guide should help in setting up and maintaining the Google Calendar integration. Refer to specific script files for more detailed internal logic.
