# Organization-Wide Calendar Implementation

## Overview

This document outlines the implementation of an organization-wide calendar system with task management integration. The system allows users to view and manage all project tasks in a shared calendar, with access controls and multiple viewing options.

## Database Schema Changes

We've made the following schema changes:

1. Created organization-wide calendar tables:

   - `organization_calendar` - Stores the organization's Google Calendar ID and settings
   - `calendar_access` - Manages employee access to the shared calendar

2. Enhanced `project_milestones` table with task management fields:
   - `assignee_type` - Type of assignee (employee, vendor, or subcontractor)
   - `assignee_id` - ID of the assigned person/entity
   - `start_date` - When the task should begin
   - `priority` - Task priority (low, medium, high, urgent)
   - `status` - Task status (not_started, in_progress, completed, blocked)
   - `estimated_hours` - Estimated hours to complete the task

## Supabase Connection and SQL Execution

### Connection Setup

The application uses the Supabase Management Control Panel (MCP) Connector to establish and manage database connections:

1. **Client Initialization**:

   ```javascript
   const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
     auth: { persistSession: false },
   });
   ```

2. **Environment Variables**:
   - `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` - The Supabase project URL
   - `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `SUPABASE_ACCESS_TOKEN` - Authentication key

### SQL Execution Methods

The application uses two primary methods for executing SQL:

1. **RPC Functions**:

   - `pgmigration` - Primary method for running migrations
   - `exec_sql` - Fallback method for executing SQL statements

   Example:

   ```javascript
   const { error } = await supabase.rpc('exec_sql', {
     sql_string: migrationSql,
   });
   ```

2. **Direct Table Access**:

   - Used for CRUD operations on tables via the Supabase client

   Example:

   ```javascript
   const { data, error } = await supabase
     .from('organization_calendar')
     .select('*')
     .order('created_at')
     .limit(1);
   ```

### Migration Application Process

Migrations are applied using the following process:

1. Read SQL file from the migrations directory
2. Attempt to execute SQL using `pgmigration` RPC function
3. If that fails, fall back to `exec_sql` RPC function
4. Verify successful migration by querying table schema

### Database Type Definitions

The Supabase database types are defined in `@/integrations/supabase/types`. When adding new tables, these types must be updated to include the new schema.

## UI Enhancements

1. Removed the redundant Calendar tab, which showed duplicate information

2. Enhanced the Schedule tab with a view switcher:

   - List view (original ProjectMilestones component)
   - Calendar view (new ProjectCalendarView component showing a monthly calendar)

3. The calendar view includes:
   - Monthly navigation
   - Tasks displayed on their due dates
   - Color-coding based on task status
   - Clicking a date shows details for that day

## Components Created/Modified

1. **New Components**:

   - `ProjectCalendarView` - Shows project tasks in a calendar format
   - `ProjectScheduleTab` - Container component with view toggle

2. **Modified Components**:
   - `ProjectDetail` - Updated to use ProjectScheduleTab instead of separate tabs
   - Removed redundant code from the ProjectDetail component

## New Hooks and Services

1. **useOrganizationCalendar**:
   - Manages the organization-wide calendar
   - Allows creating and updating the calendar
   - Handles user access permissions
   - Integrated with Google Calendar

## Benefits

1. **Improved UI Organization**:

   - Single place for viewing tasks in both list and calendar formats
   - Cleaner navigation structure
   - More intuitive user experience

2. **Enhanced Calendar Features**:

   - Organization-wide calendar for all projects
   - Access control for team members
   - Integration with existing Google Calendar functionality

3. **Better Task Management**:
   - Visual representation of tasks on calendar
   - Ability to see project schedule at a glance
   - Filter and sort capabilities in both views

## Next Steps

1. Fully implement the organization calendar management UI in an admin or settings section
2. Add functionality to view tasks from all projects in a single calendar view
3. Implement drag-and-drop scheduling in the calendar view
4. Add notification settings for calendar events and task assignments
5. Create detailed documentation for end users
6. Update database type definitions to include new calendar tables
7. Standardize on a single SQL execution method across the application
8. Create a shared utility module for database migrations
