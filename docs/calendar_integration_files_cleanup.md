# Calendar Integration Files Cleanup

## Overview

This document summarizes the cleanup of SQL and JavaScript files related to the Google Calendar integration. The goal was to organize scattered files into proper directories and remove redundant ones.

## Files Organization

### Added to Proper Locations

| File                                                    | Purpose                                                |
| ------------------------------------------------------- | ------------------------------------------------------ |
| `db/migrations/add_calendar_fields_to_time_entries.sql` | Migration to add calendar fields to time_entries table |
| `db/scripts/check_calendar_fields.sql`                  | SQL script to validate calendar fields across tables   |
| `db/scripts/validate_calendar_fields.js`                | Script to check if all calendar fields exist           |
| `db/scripts/apply_calendar_migration.js`                | Script to apply missing calendar fields if needed      |

### Removed Redundant Files

| File                             | Reason for Removal                                            |
| -------------------------------- | ------------------------------------------------------------- |
| `check_calendar_schema.sql`      | Functionality moved to db/scripts/check_calendar_fields.sql   |
| `add_calendar_fields.sql`        | Redundant with existing migrations                            |
| `add_simple_calendar_fields.sql` | Redundant with existing migrations                            |
| `update_time_entries.sql`        | Functionality moved to migration file                         |
| `fix_time_entries.sql`           | Functionality moved to migration file                         |
| `check_calendar_schema.js`       | Functionality moved to db/scripts/validate_calendar_fields.js |
| `add_missing_calendar_fields.js` | Functionality moved to db/scripts/apply_calendar_migration.js |
| `update_time_entries.js`         | Functionality moved to db/scripts/apply_calendar_migration.js |

### Remaining Test Files

| File                           | Purpose                                     | Status                                |
| ------------------------------ | ------------------------------------------- | ------------------------------------- |
| `test-calendar-integration.js` | Browser-side test script for UI integration | Kept in root directory for UI testing |

## Current Structure

### Migration Files

- `db/migrations/add_calendar_integration.sql` - Adds calendar fields to project_milestones, work_orders, and contact_interactions
- `db/migrations/add_calendar_fields_to_time_entries.sql` - Adds calendar fields to time_entries

### Validation Scripts

- `db/scripts/check_calendar_fields.sql` - SQL query to check for calendar fields
- `db/scripts/validate_calendar_fields.js` - Script to validate calendar fields exist
- `db/scripts/apply_calendar_migration.js` - Script to apply missing calendar fields

## Usage Instructions

To check if all calendar fields are properly set up:

```bash
node db/scripts/validate_calendar_fields.js
```

To apply missing calendar fields if needed:

```bash
node db/scripts/apply_calendar_migration.js
```

## Calendar Fields Status

The following tables should have these fields:

- `project_milestones`
- `maintenance_work_orders`
- `contact_interactions`
- `time_entries`

Each table should have:

- `calendar_sync_enabled` (BOOLEAN)
- `calendar_event_id` (TEXT)

These fields are required for the Google Calendar integration to work properly.
