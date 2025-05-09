# Supabase Guide for AI Agents

## Overview

This document provides comprehensive guidance for AI agents working with Supabase in this codebase. It explains connection methods, standard patterns, and best practices.

## Connection Methods

### The MCP Connector (Preferred Method)

The Management Control Panel (MCP) Connector is the primary way to interact with Supabase:

1. Start the MCP server:

   ```bash
   node start-mcp.js
   ```

2. The server provides these operations:
   - `ping` - Check connection
   - `query` - Query database tables
   - `list_projects` - List Supabase projects
   - `get_project` - Get project details
   - `exec_sql` - Execute SQL statements

### Direct API Access

For frontend and backend components, use the Supabase client directly:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Example query
const { data, error } = await supabase.from('table_name').select('*');
```

## Database Operations

### SQL Execution (Standard Pattern)

Use the utility functions in `src/integrations/supabase/utils.ts`:

```typescript
import { executeSql } from '@/integrations/supabase/utils';

// Execute SQL
const { success, error } = await executeSql(`
  CREATE TABLE IF NOT EXISTS my_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
  )
`);

if (success) {
  console.log('SQL executed successfully');
} else {
  console.error('SQL execution failed:', error);
}
```

#### SQL Function Selection

Supabase has two main SQL execution functions:

1. `execute_sql_command` - For non-SELECT statements that don't return data (CREATE, ALTER, DROP, INSERT, etc.)
2. `execute_sql_query` - For SELECT statements that return data

Our `executeSql` utility tries both functions in the appropriate order. However, be aware that:

- `execute_sql_query` will fail with statements like DROP TABLE that don't return tuples
- For complex migrations with multiple statement types, it's best to use the MCP server

### Verifying Database Objects

Use the verification functions in `src/integrations/supabase/utils.ts`:

```typescript
import { tableExists, columnsExist } from '@/integrations/supabase/utils';

// Check if table exists
const exists = await tableExists('my_table');
console.log(`Table exists: ${exists}`);

// Check if columns exist
const columns = await columnsExist('my_table', ['id', 'name', 'created_at']);
console.log('Column check results:', columns);
```

## Applying Migrations

### Standard Migration Process

1. Create a SQL migration file in `db/migrations/`
2. Run the migration using the migration runner:
   ```bash
   node db/scripts/migration-runner.cjs db/migrations/your_migration.sql
   ```

### Alternative Migration Options

For complex migrations that mix DDL and DML statements:

1. Start the MCP server in one terminal:

   ```bash
   node start-mcp.js
   ```

2. Use the MCP server's `exec_sql` operation to apply the migration directly

### Example Migration File

```sql
-- Add a new table
CREATE TABLE IF NOT EXISTS public.my_new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_my_new_table_name ON public.my_new_table(name);

-- Enable row level security
ALTER TABLE public.my_new_table ENABLE ROW LEVEL SECURITY;

-- Create access policies
CREATE POLICY "Users can view my_new_table"
ON public.my_new_table FOR SELECT
USING (TRUE);
```

## Type Definitions

When creating new tables or modifying existing ones, update the type definitions:

1. For new tables, add types to appropriate files in `src/integrations/supabase/types/`
2. For existing tables, modify the corresponding type definitions

Example type definition:

```typescript
// In src/integrations/supabase/types/my-module.ts
export interface MyNewTable {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Declare module augmentation to extend Database types
declare module '../types' {
  interface Database {
    public: {
      Tables: {
        my_new_table: {
          Row: MyNewTable;
          Insert: Omit<MyNewTable, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<MyNewTable, 'id' | 'created_at' | 'updated_at'>>;
        };
      };
    };
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection errors**: Ensure the MCP server is running with `node start-mcp.js`

2. **SQL execution fails**:

   - Check your SQL syntax
   - Use the `execute_sql_command` function for non-SELECT statements (CREATE, ALTER, DROP, etc.)
   - Use the `execute_sql_query` function for SELECT statements

3. **Unable to access tables/columns**:

   - Verify the table exists with `tableExists()`
   - Check column names with `columnsExist()`

4. **Migration error: "DROP TABLE query does not return tuples"**:
   - This occurs because `execute_sql_query` doesn't work with DROP statements
   - Use the MCP server's `exec_sql` operation for these migrations

### Logs and Debugging

- Check the MCP server output for connection errors
- Use the `console.log` statements in the utility functions for detailed error messages

## Recommended Files

The key files for Supabase integration are:

1. `start-mcp.js` - The MCP server for connecting to Supabase
2. `src/integrations/supabase/client.ts` - The Supabase client instance
3. `src/integrations/supabase/utils.ts` - Utility functions for database operations
4. `db/scripts/migration-runner.cjs` - Script for applying migrations
5. `docs/supabase_connection.md` - Detailed connection documentation

## Best Practices

1. **Use the MCP server** for development and testing
2. **Always use the utility functions** in `src/integrations/supabase/utils.ts`
3. **Follow the migration pattern** by placing SQL files in `db/migrations/`
4. **Update type definitions** when modifying the database schema
5. **Document changes** in the appropriate Markdown files
6. **Verify table and column existence** after applying migrations
