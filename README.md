# AKC Revisions Project

This repository contains the AKC Revisions application built with React, TypeScript, and Vite. It uses Supabase for database functionality and Google APIs for calendar integration.

## Quick Start: Development Environment

**Important: This application requires running both frontend and backend servers simultaneously.**

```bash
# Terminal 1: Start the backend server
cd server
node server.js

# Terminal 2: Start the frontend server
# (from project root)
npm run dev
```

The frontend will run on port 8081 (Vite) and the backend on port 3000 (Express).

## Complete Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start both servers:
   - Backend server (provides API and Google integration)
   - Frontend server (provides UI)

For detailed setup instructions, see [Development Environment Setup](./docs/development_setup.md).

## Running Tests

The project includes unit and integration tests for the calendar sync functionality:

```bash
# Install dependencies (if not already installed)
npm install --legacy-peer-deps

# Run tests
npm test
```

Tests run with Mocha and use mocked responses for both Google Calendar API and Supabase, making them fast and reliable without requiring real credentials.

## Continuous Integration

This project uses GitHub Actions for continuous integration. The workflow is defined in `.github/workflows/test.yml`.

To check the status of CI runs:

1. Visit the Actions tab in the GitHub repository, or
2. Install GitHub CLI and run:

   ```bash
   # Install GitHub CLI
   # Windows: winget install GitHub.cli
   # macOS: brew install gh
   # Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md

   # Login to GitHub
   gh auth login

   # List recent workflow runs
   gh run list

   # Watch a specific run until it completes
   gh run watch <run-id>
   ```

## Project Structure

The project follows a standard React + Vite structure with TypeScript:

- `src/` - Main source code
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `pages/` - Page components
  - `integrations/` - Third-party service integrations
  - `utils/` - Utility functions
- `server/` - Express.js backend server
  - `google-api-helpers/` - Google API integration helpers
- `db/` - Database scripts and migrations
- `public/` - Static assets
- `docs/` - Documentation
- `tests/` - Unit and integration tests

## Database (Supabase) Integration

### Connection Methods

This project uses Supabase as the backend database. There are two ways to connect:

1. **Direct API Access** - For application code:
   ```typescript
   import { supabase } from '@/integrations/supabase/client';
   ```

### Database Operations

We have standardized database utilities in `src/integrations/supabase/utils.ts` for:

- SQL execution (`executeSql`)
- Table verification (`tableExists`)
- Column verification (`columnsExist`)

### Migrations

Database migrations are stored in `db/migrations/` and can be applied using:

```bash
node db/scripts/migration-runner.cjs db/migrations/your_migration.sql
```

#### Important Migration: Calendar Sync Fix

The `supabase/migrations/20250522_fix_moddatetime.sql` migration fixes an issue with the `moddatetime()` trigger function that prevented updates to the `google_event_id` field in the `schedule_items` table. To apply this migration:

```bash
node db/scripts/migration-runner.cjs supabase/migrations/20250522_fix_moddatetime.sql
```

This migration is crucial for calendar sync functionality to work properly.

For detailed Supabase integration documentation, see:

- `docs/supabase_guide_for_agents.md`
- `docs/supabase_connection.md`

## Google Calendar Integration

The application integrates with Google Calendar for project scheduling. You'll need to:

1. Configure Google OAuth credentials
2. Set the proper redirect URIs to match your development environment
3. Use the Settings > Google Calendar page to connect your account

### Environment Variables

For calendar sync to work properly, the following environment variables must be set:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_CALENDAR_PROJECT=your_calendar_id
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=path/to/service-account.json
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See the [Development Environment Setup](./docs/development_setup.md) document for more details on configuring Google integration.

## License

Private repository. All rights reserved.
