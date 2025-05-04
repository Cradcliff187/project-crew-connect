# Supabase File Organization

## Current Status

After reviewing the codebase, I've identified several groups of Supabase-related files that need organization:

### 1. Connection Test Scripts (Redundant)

- `test-connection.js`
- `test-calendar-tables.js`
- `verify-supabase-connection.js`
- `verify-tables.cjs`
- `test-mcp-connection.js`

### 2. Migration Scripts (Redundant)

- `apply-organization-calendar.js`
- `apply-calendar-migration-direct.js`
- `apply-tables-individually.js`
- `apply-migration.js`
- `db/scripts/apply_organization_calendar_migration.js`
- `db/scripts/apply_calendar_migration.js`

### 3. SQL Execution Scripts (Redundant)

- `supabase_direct.js`
- `exec_sql.js`
- `create-exec-sql-function.js`
- `check-sql-function.js`
- `direct_alter.js`
- `update_sql.js`

### 4. Consolidated Utility Files (Keep)

- `src/integrations/supabase/utils.ts` (consolidated utility file)
- `src/integrations/supabase/types/calendar.ts` (type definitions)
- `docs/supabase_connection.md` (documentation)
- `docs/organization_calendar_implementation.md` (documentation)

## Recommended Actions

### 1. Files to Delete

These files are redundant and should be removed:

```
verify-supabase-connection.js
verify-tables.cjs
apply-organization-calendar.js
apply-calendar-migration-direct.js
apply-tables-individually.js
exec_sql.js
supabase_direct.js
check-sql-function.js
create-exec-sql-function.js
test-calendar-tables.js
```

### 2. Files to Keep

These files provide core functionality and should be kept:

```
start-mcp.js (Main MCP connector)
db/migrations/add_organization_calendar.sql (Core migration)
src/integrations/supabase/utils.ts (Consolidated utilities)
src/integrations/supabase/types/calendar.ts (Type definitions)
docs/supabase_connection.md (Documentation)
docs/organization_calendar_implementation.md (Documentation)
```

### 3. Organization Guidelines

The Supabase integration should follow these guidelines:

1. **Database Interactions**

   - All SQL execution should use the functions in `src/integrations/supabase/utils.ts`
   - Migration files should be placed in `db/migrations/`
   - Application code should use the Supabase client from `src/integrations/supabase/client.ts`

2. **Types and Schema**

   - Database types should be defined in `src/integrations/supabase/types/`
   - New tables should have corresponding type additions

3. **Documentation**
   - `docs/supabase_connection.md` provides the main guide for connecting to Supabase
   - Migration-specific documentation should be in relevant Markdown files

## Migration Process Standardization

To apply migrations:

1. Create a SQL migration file in `db/migrations/`
2. Use the MCP server via `node start-mcp.js`
3. Execute SQL using the MCP server or the utility functions in `src/integrations/supabase/utils.ts`
4. Verify the changes using the utility functions in `src/integrations/supabase/utils.ts`

Example of applying a migration:

```javascript
import { executeSql, tableExists, columnsExist } from '@/integrations/supabase/utils';

// Apply migration
const migrationSql = `
  CREATE TABLE IF NOT EXISTS my_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

const result = await executeSql(migrationSql);
if (result.success) {
  console.log('Migration successful!');
} else {
  console.error('Migration failed:', result.error);
}

// Verify table exists
const exists = await tableExists('my_table');
console.log(`Table my_table exists: ${exists}`);

// Verify columns exist
const columns = await columnsExist('my_table', ['id', 'name', 'created_at']);
console.log('Column check results:', columns);
```

## Supabase Connection Guide

The MCP (Management Control Panel) Connector is the recommended way to interact with Supabase:

1. Start the MCP server:

   ```
   node start-mcp.js
   ```

2. The server provides these operations:

   - `ping` - Check connection
   - `query` - Query database tables
   - `list_projects` - List Supabase projects
   - `get_project` - Get project details
   - `exec_sql` - Execute SQL statements

3. For more details, please refer to `docs/supabase_connection.md`
