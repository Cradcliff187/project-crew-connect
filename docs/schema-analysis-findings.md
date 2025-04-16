# Schema Analysis Findings

## Database Overview

Based on our enhanced schema validator, the Supabase database has the following characteristics:

- **Tables Analyzed**: 10 tables successfully detected
- **ID Field Patterns**: 31 ID fields across 4 different patterns
- **Date Field Patterns**: 28 date fields across 6 different patterns
- **Status Fields**: 8 tables include status fields
- **Foreign Key Relationships**: 14 inferred relationships (no direct constraints detected)

## Inconsistency Patterns

### ID Fields (4 patterns)

1. **legacy_entity_id**: Fields like `customerid`, `projectid`, `vendorid`, `subid`

   - No separator between entity name and "id" suffix
   - Common in older tables (`customers`, `projects`, `vendors`)

2. **standard_foreign_key**: Fields like `customer_id`, `project_id`, `employee_id`

   - Uses snake_case with underscore separator
   - More common in newer tables (`time_entries`, `maintenance_work_orders`)

3. **standard_id**: Simple `id` field

   - Used in some tables as the primary key
   - Generally follows modern conventions

4. **other**: Various non-standard ID patterns
   - Includes fields like `entity_id` with contextual references

### Date Fields (6 patterns)

1. **standard_created**: `created_at`

   - Standard timestamp pattern (modern convention)
   - Used in most tables

2. **standard_updated**: `updated_at`

   - Standard timestamp pattern (modern convention)
   - Used in most tables

3. **legacy_created**: `createdon`

   - Used in older tables like `projects`
   - No separator between words

4. **alternative_created**: `datecreated`

   - Used in some tables like `estimates`
   - Alternative naming convention

5. **standard_domain_date**: Fields ending with `_date`

   - Used for specific domain dates (e.g., `due_by_date`)
   - Follows snake_case convention

6. **legacy_domain_date**: Fields ending with `date` without separator
   - Used in older tables (e.g., `sentdate`)
   - No separator between words

### Status Field Conventions

- **Mixed casing**: Two different conventions detected
  - **lowercase**: 2 tables (`projects`, `estimates`)
  - **uppercase**: 6 tables (including `customers`, `vendors`, `subcontractors`, `employees`)

## Table-Specific Findings

### Projects Table

- 26 columns
- Primary ID: `projectid` (legacy_entity_id pattern)
- Status values are lowercase
- Uses `createdon` instead of `created_at`
- 7 ID fields indicating many relationships
- **Alignment**: Aligned with frontend Project interface!

### Customers Table

- 13 columns
- Primary ID: `customerid` (legacy_entity_id pattern)
- Status values are UPPERCASE
- Mixed date field patterns

### Vendors Table

- 17 columns
- Primary ID: `vendorid` (legacy_entity_id pattern)
- Status values are UPPERCASE

### Subcontractors Table

- 30 columns
- Primary ID: `subid` (legacy_entity_id pattern)
- Status values are UPPERCASE

### Maintenance Work Orders Table

- 21 columns
- Primary ID: `work_order_id` (standard_foreign_key pattern)
- Status values are UPPERCASE
- 5 date fields (most in the database)

### Estimates Table

- 24 columns
- Primary ID: `estimateid` (legacy_entity_id pattern)
- Status values are lowercase
- 5 date fields including non-standard patterns

### Expenses Table

- 21 columns
- 7 ID fields (most in the database)
- Status values are UPPERCASE

### Time Entries Table

- 15 columns
- No status field
- Uses modern naming conventions

### Change Orders Table

- Could not analyze in detail
- Table exists but might not have data

### Employees Table

- 10 columns
- Primary ID: `employee_id` (standard_foreign_key pattern)
- Status values are UPPERCASE
- **Alignment**: Aligned with frontend Employee interface!

## Frontend-Database Alignment

- Only 2 frontends types were defined in the validator: `Employee` and `Project`
- Both showed proper alignment with their database tables
- Other entity types need frontend interface definitions

## Relationship Analysis

- 14 inferred relationships were detected
- No direct foreign key constraints were found in the database
- Relationships are enforced in application code rather than database level
- Common patterns like entity references (`entity_id` + `entity_type`) are used

## Recommendations

Based on these findings, we recommend:

1. **Standardize ID patterns**:

   - Adopt either `entity_id` (recommended) or simple `id` consistently
   - Update frontend interfaces to match

2. **Standardize date fields**:

   - Use `created_at` and `updated_at` consistently
   - Use `entity_date` pattern for domain-specific dates

3. **Standardize status values**:

   - Use UPPERCASE for all status values (matches 6/8 tables)
   - Create a consistent enum of possible status values

4. **Add database-level constraints**:

   - Define proper foreign key constraints in the database
   - Add appropriate indexes for performance

5. **Complete frontend type definitions**:

   - Define interfaces for all entities to ensure alignment
   - Use consistent naming and typing

6. **Implement adapter layer**:

   - Create a mapping layer between frontend and database
   - This allows gradual database standardization without breaking code

7. **Document standards**:
   - Create formal naming convention documentation
   - Enforce standards through code reviews and CI/CD checks

This analysis provides a clear picture of the current schema inconsistencies and a path toward standardization without disrupting existing functionality.
