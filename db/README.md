# Database Directory Structure

This directory contains all database-related files for the AKC application, including migrations, functions, and utility scripts.

## Directory Structure

- `/migrations` - Numbered migration files that should be applied in sequence
- `/functions` - Current, production-ready database function definitions
- `/scripts` - Utility scripts for database maintenance and validation
- `/tests` - Test scripts for database functionality
- `/archive` - Historical versions of database objects (for reference only)

## Migration Naming Convention

Migration files should follow this naming convention:

```
NNN_descriptive_name.sql
```

Where:

- `NNN` is a 3-digit sequential number (001, 002, etc.)
- `descriptive_name` describes what the migration does
- `.sql` is the file extension

Example: `001_convert_estimate_function.sql`

## Adding New Database Objects

1. **Database Functions**:

   - Create a new migration file in `/migrations` with the next sequence number
   - Place the current version of the function in `/functions` for reference

2. **Schema Changes**:

   - Add a new migration file for any schema changes
   - Include the proper up/down migration paths

3. **Development Process**:
   - Develop and test new functions in isolation
   - Once approved, create a proper migration file
   - Move any experimental versions to `/archive`

## Current Database Functions

- `convert_estimate_to_project(p_estimate_id TEXT)` - Converts an estimate to a project

## Applying Migrations

Migrations should be applied through the application's database setup tools.
You can also manually apply migrations via the Supabase UI or using the database client.

To apply a migration file, you can use:

```typescript
// In your application code
import { supabase } from '@/integrations/supabase/client';

async function applyMigration(sqlContent: string): Promise<void> {
  const { error } = await supabase.rpc('exec_sql', { sql_string: sqlContent });
  if (error) {
    console.error('Error applying migration:', error);
    throw error;
  }
}
```
