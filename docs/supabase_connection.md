# Supabase Connection and SQL Execution Guide

## Overview

This document describes how to connect to Supabase and execute SQL statements in the application. We use a custom MCP (Management Control Panel) Connector for most interactions with Supabase, but there are also direct integration options available.

## Connection Methods

### 1. MCP Connector

The MCP Connector is a Node.js server that sits between the application and Supabase, providing a simplified API for common operations.

#### Starting the MCP Connector

```bash
node start-mcp.js
```

This starts a local server that proxies requests to Supabase and provides the following operations:

- ping - Check connection
- query - Query database tables
- list_projects - List Supabase projects
- get_project - Get project details
- exec_sql - Execute SQL statements

### 2. Direct Supabase Client

For frontend and some backend operations, we use the Supabase JavaScript client directly:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);
```

## SQL Execution Methods

### 1. Using RPC Functions

We use two primary RPC functions for executing SQL:

#### a. pgmigration

```javascript
const { error } = await supabase.rpc('pgmigration', { sql: sqlString });
```

#### b. exec_sql

```javascript
const { error } = await supabase.rpc('exec_sql', { sql_string: sqlString });
```

Our standard practice is to try `pgmigration` first, then fall back to `exec_sql` if needed.

### 2. Direct Table Operations

For CRUD operations on tables, we use the Supabase client's table methods:

```javascript
// Query data
const { data, error } = await supabase.from('table_name').select('*').order('created_at').limit(10);

// Insert data
const { data, error } = await supabase
  .from('table_name')
  .insert({ field: 'value' })
  .select()
  .single();

// Update data
const { error } = await supabase
  .from('table_name')
  .update({ field: 'new_value' })
  .eq('id', 'record_id');

// Delete data
const { error } = await supabase.from('table_name').delete().eq('id', 'record_id');
```

## Migration Utilities

We've created a set of utility functions to standardize migrations and SQL execution in `db/scripts/migration-utils.js`:

### Key Functions

1. `createSupabaseClient()` - Creates a standardized Supabase client
2. `executeSql(supabase, sql)` - Executes SQL using available RPC functions
3. `applyMigrationFromFile(migrationPath)` - Applies a migration from a file
4. `verifyTableExists(supabase, tableName)` - Verifies a table exists in the database

### Example Usage

```javascript
const { applyMigrationFromFile, verifyTableExists } = require('./migration-utils');

// Apply migration
const result = await applyMigrationFromFile('./migrations/my_migration.sql');

// Verify tables created
const tableExists = await verifyTableExists(supabase, 'my_table');
```

## Type System Integration

When working with Supabase in TypeScript, make sure to define appropriate types for your database tables. For new tables, create type definitions in the corresponding type files.

For example, for calendar-related tables:

```typescript
// in src/types/calendar.ts
export type CalendarAccessLevel = 'read' | 'write' | 'admin';

export interface OrganizationCalendar {
  id: string;
  google_calendar_id: string | null;
  is_enabled: boolean;
  name: string;
  created_at: string;
  updated_at: string;
}
```

## Troubleshooting

If you encounter errors connecting to Supabase:

1. Verify that the MCP server is running: `node start-mcp.js`
2. Check that environment variables are set correctly
3. Ensure you're using the correct Supabase URL and key
4. For SQL errors, check the SQL syntax and verify table existence

For more detailed diagnostics, check the MCP server output and application logs.
