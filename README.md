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

For detailed Supabase integration documentation, see:

- `docs/supabase_guide_for_agents.md`
- `docs/supabase_connection.md`

## Google Calendar Integration

The application integrates with Google Calendar for project scheduling. You'll need to:

1. Configure Google OAuth credentials
2. Set the proper redirect URIs to match your development environment
3. Use the Settings > Google Calendar page to connect your account

See the [Development Environment Setup](./docs/development_setup.md) document for more details on configuring Google integration.

## License

Private repository. All rights reserved.
