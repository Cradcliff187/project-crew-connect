# AKC Revisions Cleanup Report

## File Discovery & Classification

### README & Documentation Files

- README.md (Root) - Main comprehensive project documentation
- AI_AGENT_GUIDE.md (Root) - Guide for AI assistants to help with the project
- CALENDAR_INTEGRATION_SETUP.md (Root) - Setup guide for Google Calendar integration
- COMPLETED.md (Root) - List of completed tasks
- GOOGLE_CALENDAR_SETUP.md (Root) - Another Google Calendar setup guide
- docs/development_setup.md - Development environment setup guide
- docs/supabase_guide_for_agents.md - Supabase guide for AI agents
- docs/supabase_connection.md - Supabase connection instructions
- docs/google-calendar-auth.md - Google Calendar authentication guide
- docs/deploy-calendar-webhook.md - Calendar webhook deployment guide
- docs/organization_calendar_implementation.md - Calendar implementation details for organizations
- docs/task_calendar_implementation.md - Calendar implementation details for tasks
- docs/file_audit_summary.md - Prior file audit summary
- docs/calendar-integration-verification.md - Calendar integration verification guide
- docs/supabase_cleanup_summary.md - Supabase cleanup summary
- Ai Agent Helper Files/README_Cleanup_Prompt.md - This cleanup plan
- Ai Agent Helper Files/README_SUPABASE_MAINTENANCE.md - Supabase maintenance guide
- Ai Agent Helper Files/SUPABASE_MCP_AUDIT.md - Audit of Supabase MCP
- Ai Agent Helper Files/construction-pm-plan.md - Construction project management plan
- Various other markdown files in the docs/ and Ai Agent Helper Files/ directories

### Test Files

- test-calendar-integration.js (Root) - Tests Google Calendar integration
- test-connection.js (Root) - Tests database connection
- test-existing-functions.js (Root) - Tests existing Supabase functions
- test-supabase-integration.js (Root) - Tests Supabase integration
- simple-calendar-test.cjs (Root) - Simple test for Google Calendar access
- run-calendar-tests.cjs (Root) - Script to run calendar tests
- direct-calendar-test.cjs (Root) - Tests calendar functionality directly
- db/tests/\* (Database test files)

### Redundant Calendar Test Files

After examination, there are several overlapping test files:

- test-calendar-integration.js and simple-calendar-test.cjs both test Google Calendar API access
- direct-calendar-test.cjs and run-calendar-tests.cjs appear to have duplicate functionality

### Google API & Calendar Integration Files

- register-calendar-webhook.cjs (Root) - Registers Google Calendar webhooks
- scheduled-webhook-renewal.cjs (Root) - Script for scheduled renewal of webhooks
- scheduled-webhook-renewal.js (Root) - Alternative version of the webhook renewal script
- renew-calendar-webhooks.bat (Root) - Batch file to run webhook renewal
- setup-renewal-task.ps1 (Root) - PowerShell script to setup renewal task
- setup-user-task.bat (Root) - Batch file to setup user tasks
- credentials/calendar-service-account.json - Google service account credentials
- supabase/functions/calendarWebhook/ - Supabase Edge Function for calendar webhooks
- supabase/functions/calendarWebhook.ts - Typescript implementation of calendar webhook

### MCP Configuration Files

- supabase/config.toml - Supabase configuration file
- package.json - Contains MCP dependencies (@supabase/mcp-server-supabase)
- check_schema_package.json - Simplified package.json for schema checks

### Supabase Config/SQL Files

- db/migrations/\* - SQL migrations
- db/functions/\* - SQL functions
- update_sql.js (Root) - Script to update SQL
- direct_alter.js (Root) - Script to directly alter database
- apply-migration.js (Root) - Script to apply migrations

### Environment & Credentials Files

- .env (Root, not in repository) - Environment variables file
- env-template.txt (Root) - Template for environment variables
- env-complete.txt (Root) - Complete list of environment variables
- create-env.ps1 (Root) - PowerShell script to create .env file
- credentials/calendar-service-account.json - Google service account credentials

### Helper Scripts & Utilities

- setup-user-task.bat (Root) - Sets up user tasks
- setup-renewal-task.ps1 (Root) - Sets up renewal tasks
- create-env.ps1 (Root) - Creates environment file

### Redundant/Placeholder Files

- scheduled-webhook-renewal.cjs and scheduled-webhook-renewal.js appear to be duplicates with one in CommonJS and one in ES module format
- Numerous overlapping markdown files in docs/ and Ai Agent Helper Files/
- Multiple Google Calendar setup guides across different files

## Detailed Reorganization Plan

### 1. Implemented Directory Structure

```
AKC Revisions-V1/
├── README.md             # Main consolidated documentation
├── .env                  # Environment variables (not in repo)
├── env-template.txt      # Environment template
├── src/                  # Application source code (unchanged)
├── public/               # Public assets (unchanged)
├── db/                   # Database files
│   ├── migrations/       # SQL migrations
│   ├── functions/        # SQL functions
│   ├── scripts/          # Database utility scripts
│   └── tests/            # Database tests
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge Functions
│   └── config.toml       # Config file
├── credentials/          # Credential files (gitignored)
├── tests/                # Consolidated test files
│   ├── integration/      # Integration tests
│   ├── supabase/         # Supabase tests
│   └── calendar/         # Calendar integration tests
├── tools/                # Utility tools
│   ├── calendar/         # Calendar utils
│   │   └── webhooks/     # Webhook scripts
│   └── setup/            # Setup scripts
├── docs/                 # Additional documentation
│   ├── guides/           # User guides
│   ├── ai-guides/        # AI-generated documentation
│   ├── api/              # API documentation
│   ├── development/      # Developer guides
│   ├── db/               # Database documentation
│   └── project-history/  # Project history and completed tasks
└── scripts/              # Root level scripts
```

### 2. Documentation Consolidation Plan

Created a comprehensive README.md that includes:

1. Project Overview
2. Quick Start Guide
3. Development Environment Setup
4. Project Structure
5. Key Features
6. Integration Guides
   - Supabase
   - Google Calendar
7. Maintenance Procedures
8. Troubleshooting
9. Reference to detailed docs

### 3. File Movement Plan

#### Files Moved:

1. **Calendar Integration Files**:

   - Moved all calendar webhook files to `/tools/calendar/webhooks/`
   - Consolidated calendar tests to `/tests/calendar/`

2. **Test Files**:

   - Moved all test-\*.js files to `/tests/`
   - Organized by test type (supabase, calendar)

3. **Scripts**:

   - Moved setup scripts to `/tools/setup/`
   - Moved database scripts to `/db/scripts/`

4. **Documentation**:

   - Consolidated README template created at `/docs/development/README_CONSOLIDATED.md`
   - Created new verification guide at `/docs/development/verification-guide.md`
   - Organized all AI agent documentation in `/docs/ai-guides/` with proper subdirectories

5. **AI Agent Files**:
   - Consolidated files from `Ai Agent Helper Files/` and `ai-agent-helpers/` into `/docs/ai-guides/`
   - Organized by category:
     - `supabase/` - Supabase-related guides
     - `ui-ux/` - UI/UX documentation
     - `implementation/` - Implementation plans and analysis
     - `google-calendar/` - Calendar integration guides

## Implementation Progress

### Completed Actions:

1. **Directory Structure Creation**:

   - ✅ Created `tests/` directory with subdirectories for calendar, integration, and supabase tests
   - ✅ Created `tools/` directory with subdirectories for calendar utilities and setup scripts
   - ✅ Created reorganized documentation structure in `docs/`
   - ✅ Created `scripts/` directory for general utility scripts
   - ✅ Created AI guides directory structure with subject-specific subdirectories

2. **File Movement**:

   - ✅ Moved calendar test files to `tests/calendar/`
   - ✅ Moved Supabase test files to `tests/supabase/`
   - ✅ Moved calendar webhook scripts to `tools/calendar/webhooks/`
   - ✅ Moved setup scripts to `tools/setup/`
   - ✅ Moved database scripts to `db/scripts/`
   - ✅ Moved all AI agent helper files to appropriate directories under `docs/ai-guides/`
   - ✅ Moved loose documentation files to appropriate documentation directories

3. **Documentation Consolidation**:

   - ✅ Created consolidated README template at `docs/development/README_CONSOLIDATED.md`
   - ✅ Created verification guide at `docs/development/verification-guide.md`
   - ✅ Created new README.md.new file for root directory
   - ✅ Created AI guides overview README at `docs/ai-guides/README.md`

4. **Final Documentation Update**:

   - ✅ Replaced the old README.md with the new consolidated version
   - ✅ Saved the old README as README.md.old for reference

5. **Verification Testing**:
   - ✅ Successfully tested Supabase connection with new file structure
   - ✅ Successfully tested Google Calendar webhook registration with new file structure
   - ✅ Updated file paths in test scripts to accommodate the new structure

## Test Results

### Supabase Connection Test

```
Testing Supabase connection...
Successfully connected to Supabase!
Retrieved 1 items
First item structure: [id, estimate_id, description, quantity, unit_price, total_price, cost, markup_percentage, markup_amount, gross_margin]
source_item_id column exists: YES
The column is already present. No migration needed.
```

### Calendar Webhook Registration Test

```
Environment variables set:
- SUPABASE_URL: https://zrxezqllmpdlhiudutme.s...
- SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
- SUPABASE_SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...
...
Checking access to primary calendar: primary
✅ Successfully accessed calendar: "calendar-sync-bot@crm-live-458710.iam.gserviceaccount.com"
✅ Registering webhook for primary calendar
ℹ️ Channel already exists for primary:
- Channel ID: channel-id-12345
  Expires: 5/12/2025, 12:26:00 PM
...
Webhook registration process completed.
```

## Recommendations for Future Maintenance

1. **Path References**: When creating new scripts or tests, use relative paths from the script's location to the project root:

   ```javascript
   const path = require('path');
   const rootDir = path.resolve(__dirname, '../../');
   ```

2. **Environment Variables**: Use a consistent approach for loading environment variables:

   ```javascript
   require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
   ```

3. **Documentation Strategy**:

   - Keep the main README.md in the root directory for high-level documentation
   - Place detailed guides in the appropriate docs/ subdirectory
   - Cross-reference documentation rather than duplicating it
   - Place AI-generated documentation in the ai-guides/ directory with proper categorization

4. **Testing Organization**:

   - Continue to organize tests by type in the tests/ directory
   - Use consistent naming conventions for test files

5. **Script Management**:
   - Keep utility scripts in the tools/ directory
   - Use consistent script file extensions (.js or .cjs)

## Next Steps

1. After verifying that all functionality works with the new structure:

   - Consider removing the now-redundant files from root directory
   - Remove the duplicate AI Agent directories after confirming all content is properly migrated

2. Consider creating standardized templates for:

   - New tests
   - New migrations
   - Documentation updates

3. Maintain the cleaner directory structure for all future development

## Status

Reorganization Complete ✅ - The project has been successfully reorganized into a cleaner, more maintainable structure with consolidated AI-generated documentation.
