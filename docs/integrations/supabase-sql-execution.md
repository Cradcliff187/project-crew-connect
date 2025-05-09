# Executing SQL in Supabase

This document explains how to execute SQL statements directly in Supabase using various methods.

## Method 1: Using the Supabase JavaScript Client

The most reliable method is to use the built-in RPC functions that Supabase provides. There are two main functions:

1. `execute_sql_command` - For SQL statements that don't return data (CREATE, ALTER, INSERT, etc.)
2. `execute_sql_query` - For SQL statements that return data (SELECT)

### Example:

```javascript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('https://zrxezqllmpdlhiudutme.supabase.co', 'your-api-key');

// For commands that don't return data (CREATE, ALTER, INSERT, etc.)
const { data, error } = await supabase.rpc('execute_sql_command', {
  p_sql: 'ALTER TABLE my_table ADD COLUMN new_column TEXT;',
});

// For queries that return data (SELECT)
const { data, error } = await supabase.rpc('execute_sql_query', {
  p_sql: 'SELECT * FROM my_table;',
});
```

## Method 2: Using the MCP

If you have the Cursor MCP configured, you can execute SQL through it. Make sure your `.cursor/mcp.json` file has the correct configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "your-access-token",
        "--connection-string",
        "postgresql://mcp_role:password@zrxezqllmpdlhiudutme.supabase.co:5432/postgres"
      ]
    }
  }
}
```

## Method 3: Using the Supabase Dashboard

For one-off SQL operations, you can also use the SQL Editor in the Supabase Dashboard:

1. Log in to the Supabase Dashboard
2. Select your project
3. Click on "SQL Editor" in the left navigation
4. Enter your SQL statement
5. Click "Run" to execute it

## Tips for Successful SQL Execution

1. Use `IF EXISTS` or `IF NOT EXISTS` clauses to prevent errors if objects already exist or don't exist
2. Test SELECT queries before running commands that modify data or structure
3. For large operations, consider breaking them into smaller transactions
4. Use the appropriate function (`execute_sql_command` vs. `execute_sql_query`) depending on whether your SQL returns data

## Recent Database Changes

### May 2025: Calendar Integration Fields Added

We've added the following columns to support Google Calendar integration:

- `time_entries.calendar_sync_enabled` (BOOLEAN)
- `time_entries.calendar_event_id` (TEXT)
- `maintenance_work_orders.calendar_sync_enabled` (BOOLEAN)
- `maintenance_work_orders.calendar_event_id` (TEXT)
- `project_milestones.calendar_sync_enabled` (BOOLEAN)
- `project_milestones.calendar_event_id` (TEXT)
- `contact_interactions.calendar_sync_enabled` (BOOLEAN)
- `contact_interactions.calendar_event_id` (TEXT)
