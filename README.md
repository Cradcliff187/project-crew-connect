# AKC Revisions Project

This repository contains the AKC Revisions application built with React, TypeScript, and Vite. It uses Supabase for database functionality and Google APIs for calendar integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Structure](#project-structure)
4. [Supabase Integration](#supabase-integration)
5. [Google Calendar Integration](#google-calendar-integration)
6. [Testing](#testing)
7. [Maintenance](#maintenance)
8. [Troubleshooting](#troubleshooting)

## Quick Start

**Important: This application requires running both frontend and backend servers simultaneously.**

### 1. Environment Setup

First, make sure you have the `.env` file set up with all required credentials:

```bash
# Run the provided PowerShell script to create .env file
powershell -File tools/setup/create-env.ps1
```

### 2. Start the Servers

**CRITICAL: Both servers must be started from the project root directory!**

```bash
# Terminal 1: Start the backend server (from project root)
node server/server.js

# Terminal 2: Start the frontend server (from project root)
npm run dev
```

The frontend will run on port 8080 (Vite) and the backend on port 3000 (Express).

You can access the application at: http://localhost:8080

### 3. Verify Server Status

The backend server should display:

```
DEBUG: Loaded Env Vars:
  GOOGLE_CLIENT_ID: Loaded
  GOOGLE_CLIENT_SECRET: Loaded
  GOOGLE_REDIRECT_URI: Loaded
  GOOGLE_MAPS_API_KEY: Loaded
  SUPABASE_URL: Loaded
  SUPABASE_SERVICE_ROLE_KEY: Loaded
----------------------------------------
Server started successfully on port 3000
```

The frontend server should display:

```
VITE v5.4.x ready in xxx ms
➜ Local: http://localhost:8080/
➜ Network: http://xxx.xxx.xxx.xxx:8080/
```

### 4. Common Issues and Solutions

- **`supabaseKey is required`**: The .env file isn't loaded properly. Make sure you're running from the project root, and the .env file contains SUPABASE_SERVICE_ROLE_KEY.

- **Maps not working**: The GOOGLE_MAPS_API_KEY is missing. Add it to .env:

  ```bash
  echo "GOOGLE_MAPS_API_KEY=AIzaSyCYCkSgaTqL25zJhMbwBnD4gMVlJzdSw0I" >> .env
  ```

- **Calendar integration failing**: Make sure the following calendar IDs are in .env:
  ```bash
  GOOGLE_CALENDAR_PROJECT=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
  GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
  ```

## Development Environment Setup

### Prerequisites

- Node.js and npm installed
- PowerShell (for Windows users)
- Access to the project's Google API credentials
- Supabase project access

### Complete Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the `.env` file:
   ```bash
   powershell -File tools/setup/create-env.ps1
   ```
4. Start both servers as described in the [Quick Start](#quick-start) section

For more detailed setup instructions, see [Development Environment Guide](./docs/development/environment-setup.md).

### Starting the Development Environment

To run the application locally for development:

1.  **Start the backend server** (if not already running as part of a combined script):

    ```bash
    cd server
    node server.js
    # Or your specific command for starting the backend
    ```

    The backend server typically runs on `http://localhost:3000`.

2.  **Start the frontend Vite development server**:

    - **Standard Dev Mode (Mocks Google Calendar writes):**
      ```bash
      npm run dev
      ```
    - **Dev Mode with Actual Calendar Writes (for end-to-end testing of Google Calendar):**
      ```bash
      npm run dev:e2e
      ```
      This mode sets `googleCalendarService` to operate as if in production, making real API calls.

    The frontend is typically available at `http://localhost:8080` or `http://localhost:8081` (check your Vite config).

## Project Structure

The project follows a clean and organized structure:

```
AKC Revisions-V1/
├── README.md             # Main documentation
├── .env                  # Environment variables (not in repo)
├── src/                  # Application source code
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── integrations/     # Third-party service integrations
│   └── utils/            # Utility functions
├── public/               # Static assets
├── db/                   # Database files
│   ├── migrations/       # SQL migrations
│   ├── functions/        # SQL functions
│   ├── scripts/          # Database utility scripts
│   └── tests/            # Database tests
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge Functions
│   └── config.toml       # Config file
├── server/               # Express.js backend server
│   └── google-api-helpers/ # Google API helpers
├── tests/                # Test files
│   ├── calendar/         # Calendar tests
│   └── supabase/         # Supabase tests
├── tools/                # Utility tools
│   ├── calendar/         # Calendar utils
│   │   └── webhooks/     # Webhook scripts
│   └── setup/            # Setup scripts
└── docs/                 # Additional documentation
```

## Supabase Integration

### Connection Methods

This project uses Supabase as the backend database. There are two ways to connect:

1. **Direct API Access** - For application code:

   ```typescript
   import { supabase } from '@/integrations/supabase/client';
   ```

2. **Service Role Access** - For backend operations:
   ```javascript
   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
   ```

### Database Operations

We have standardized database utilities in `src/integrations/supabase/utils.ts` for:

- SQL execution (`executeSql`)
- Table verification (`tableExists`)
- Column verification (`columnsExist`)

### Migrations

Database migrations are stored in `db/migrations/` and can be applied using:

```bash
node db/scripts/apply-migration.js db/migrations/your_migration.sql
```

For detailed Supabase integration documentation, see [Supabase Guide](./docs/guides/supabase-guide.md).

## Google Calendar Integration

The application integrates with Google Calendar for project scheduling:

### Setup

1. Configure Google OAuth credentials
2. Set proper redirect URIs to match your development environment
3. Use the Settings > Google Calendar page to connect your account

### Required Configuration

The integration requires these environment variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_CALENDAR_PROJECT`
- `GOOGLE_CALENDAR_WORK_ORDER`
- `GOOGLE_APPLICATION_CREDENTIALS`

### Webhook Registration

To enable real-time calendar synchronization:

```bash
node tools/calendar/webhooks/register-calendar-webhook.cjs
```

### Webhook Renewal

Calendar webhooks expire after 7 days. Set up automatic renewal:

```bash
# Set up scheduled task
powershell -File tools/setup/setup-renewal-task.ps1
```

See [Google Calendar Guide](./docs/guides/google-calendar-guide.md) for more details.

## Testing

### Running Tests

The project includes various tests for different components:

```bash
# Run Supabase connection test
node tests/supabase/test-connection.js

# Run Calendar integration test
node tests/calendar/test-calendar-integration.js
```

### End-to-End Testing

The project uses Playwright for end-to-end testing:

```bash
# Install Playwright dependencies
npx playwright install

# Run tests
npx playwright test
```

## Maintenance

### Regular Tasks

1. Re-register webhooks before they expire (every 7 days)
2. Monitor Supabase logs for errors
3. Check that calendar events are being properly synchronized

### Updating Calendar IDs

If calendar IDs change:

1. Update the `.env` file with new IDs
2. Run `node tools/calendar/webhooks/register-calendar-webhook.cjs` to register webhooks
3. Update the settings in Supabase with the new calendar IDs

For more maintenance details, see [Maintenance Guide](./docs/guides/maintenance-guide.md).

## Troubleshooting

### Common Issues

#### 404 Errors for Supabase Functions

If you see errors like `GET_LAST_CALENDAR_SYNC_INFO 404 (Not Found)`:

1. The necessary database functions are missing or have errors
2. Fix by applying the database migration:

   ```bash
   node db/scripts/apply-migration.js db/migrations/add_calendar_integration.sql
   ```

#### Authentication Failures

If Google authentication is failing:

1. Verify the OAuth consent screen is configured correctly
2. Check that the redirect URI matches your local development environment
3. Verify all required scopes are enabled in the Google Cloud Console
4. Clear browser cookies/local storage and try authenticating again

For more detailed troubleshooting, see [Troubleshooting Guide](./docs/guides/troubleshooting.md).

## License

Private repository. All rights reserved.
