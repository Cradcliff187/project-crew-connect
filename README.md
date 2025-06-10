# AKC Revisions Project

This repository contains the AKC Revisions application built with React, TypeScript, and Vite. It uses Supabase for database functionality and Google APIs for calendar integration.

## 🚀 Production Status

**✅ LIVE AND OPERATIONAL**: https://project-crew-connect-dbztoro5pq-ul.a.run.app

- **Platform**: Google Cloud Run (Project: crm-live-458710)
- **OAuth**: Fully configured and working
- **Access**: Public access enabled
- **Documentation**: See `PRODUCTION_SETUP_DOCUMENTATION.md` for complete details

## 🎯 **NEW DEVELOPERS START HERE**

### **📚 Essential Reading**

1. **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - Current system status and recent updates
2. **[CODEBASE_ORGANIZATION.md](CODEBASE_ORGANIZATION.md)** - Complete architecture overview
3. **[ROLE_BASED_TIME_TRACKING_IMPLEMENTATION.md](ROLE_BASED_TIME_TRACKING_IMPLEMENTATION.md)** - 🆕 Role-based time tracking system
4. **[PHASE_2_IMPLEMENTATION_COMPLETE.md](PHASE_2_IMPLEMENTATION_COMPLETE.md)** - 🆕 Phase 2 completion summary
5. **[docs/README.md](docs/README.md)** - Documentation index and navigation

### **🚀 Recent Major Updates**

- ✅ **🆕 Phase 2 Complete** - Data hooks, Quick Log Wizard, and enhanced dashboards
- ✅ **🆕 Admin User Setup** - Chris Radcliff has full administrative access
- ✅ **🆕 Role-Based Time Tracking** - Complete field user and admin interfaces with overtime management
- ✅ **Intelligent Scheduling System** - Context-aware calendar selection and UX improvements
- ✅ **API URL Fixes** - Resolved 401 Unauthorized errors with proper proxy configuration
- ✅ **Enhanced UX** - Uniform interface with cognitive load reduction
- ✅ **Complete Documentation** - Comprehensive guides for future development

---

## 🎨 **Role-Based Time Tracking System**

### **🔑 Admin Access - Chris Radcliff**

**Chris Radcliff** (`cradcliff@austinkunzconstruction.com`) has **full administrative access** including:

- ✅ **Complete Time Entry Management** - View, create, edit, and process all time entries
- ✅ **Bulk Processing Operations** - Process multiple entries simultaneously
- ✅ **Employee Management** - Full access to all employee records
- ✅ **Real-Time Analytics** - Cost calculations and overtime tracking
- ✅ **Mobile Access** - Full functionality across all devices
- ✅ **Audit Trail Access** - Complete activity logging and compliance

### **Field User Experience**

- **Mobile-First Dashboard** - Beautiful assignment cards with priority indicators
- **Quick Log Wizard** - Step-by-step time entry with automatic overtime calculation
- **Receipt Management** - Camera integration with OCR processing
- **Weekly Overview** - Personal time entry management and status tracking

### **Administrator Experience**

- **Comprehensive Management** - Bulk processing, filtering, and export capabilities
- **Overtime Tracking** - Automatic calculation and visualization
- **Cost Analysis** - Real-time cost and billable amount calculations
- **Audit Trail** - Complete activity logging for compliance

### **Technical Features**

- **Role-Based Authentication** - Secure admin/field_user role system
- **Database Migration** - Enhanced schema with overtime and receipt support
- **TypeScript Coverage** - Complete type safety across all components
- **Responsive Design** - Consistent with existing scheduling system excellence

---

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

The frontend will run on port 8080 (Vite) and the backend on port 3000 (Express).

## Complete Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. **🆕 Apply role-based migration:**
   ```bash
   node db/scripts/apply-role-migration.cjs
   ```
4. **🆕 Setup admin user (if needed):**
   ```bash
   node db/scripts/setup-admin-user.cjs
   ```
5. Start both servers:
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
    - `scheduling/` - **🆕 Intelligent scheduling system**
    - `auth/` - **🆕 Role-based authentication components**
    - `time-entries/` - **🆕 Time tracking components**
  - `services/` - **🆕 Business logic services**
  - `types/` - **🆕 Role-based TypeScript definitions**
  - `hooks/` - **🆕 Data management hooks**
    - `useRoleBasedTimeEntries.ts` - **🆕 Time entry management**
    - `useReceipts.ts` - **🆕 Receipt management**
  - `pages/` - Page components
    - `FieldUserDashboard.tsx` - **🆕 Field user interface**
    - `AdminTimeEntries.tsx` - **🆕 Admin time management**
  - `integrations/` - Third-party service integrations
  - `utils/` - Utility functions
- `server/` - Express.js backend server
  - `google-api-helpers/` - Google API integration helpers
- `db/` - Database scripts and migrations
  - `scripts/apply-role-migration.cjs` - **🆕 Role-based migration**
  - `scripts/setup-admin-user.cjs` - **🆕 Admin user setup**
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

#### **🆕 Role-Based Time Tracking Migration**

The `db/scripts/apply-role-migration.cjs` migration adds comprehensive role-based functionality:

```bash
node db/scripts/apply-role-migration.cjs
```

This migration adds:

- Role-based authentication system
- Enhanced time entries with overtime tracking
- Receipt management with OCR support
- Activity logging for audit trails

#### **🆕 Admin User Setup**

The `db/scripts/setup-admin-user.cjs` script configures admin access:

```bash
node db/scripts/setup-admin-user.cjs
```

This script ensures Chris Radcliff has full administrative access across all platforms.

#### Important Migration: Calendar Sync Fix

The `supabase/migrations/20250522_fix_moddatetime.sql` migration fixes an issue with the `moddatetime()` trigger function that prevented updates to the `google_event_id` field in the `schedule_items` table. To apply this migration:

```bash
node db/scripts/migration-runner.cjs supabase/migrations/20250522_fix_moddatetime.sql
```

This migration is crucial for calendar sync functionality to work properly.

For detailed Supabase integration documentation, see:

- `docs/supabase_guide_for_agents.md`
- `docs/supabase_connection.md`

## 📅 Google Calendar Integration

The application uses **shared Google Calendars** for project and work order scheduling. Events are created by a service account, not individual users.

### Key Features:

- **Shared Calendars**: Separate calendars for Projects and Work Orders
- **Service Account**: All events created by `project-crew-connect@crm-live-458710.iam.gserviceaccount.com`
- **Automatic Sync**: Events created when projects/work orders are scheduled

### Critical Documentation:

**⚠️ IMPORTANT**: See [CALENDAR_INTEGRATION_FINAL_DOCUMENTATION.md](./CALENDAR_INTEGRATION_FINAL_DOCUMENTATION.md) for complete setup and configuration details.

### Environment Variables

For calendar sync to work properly, the following environment variables must be set:

```
GOOGLE_CLIENT_ID=1061142868787-n4u3sjcg99s5b4hr112ncd62ql2b3e4c.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_SERVICE_ACCOUNT_EMAIL=project-crew-connect@crm-live-458710.iam.gserviceaccount.com
VITE_GOOGLE_CALENDAR_PROJECTS=c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com
VITE_GOOGLE_CALENDAR_WORK_ORDER=c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See the [Development Environment Setup](./docs/development_setup.md) document for more details on configuring Google integration.

## License

Private repository. All rights reserved.
