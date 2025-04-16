# Schema Standardization Implementation

This document outlines our approach to standardizing the database schema while maintaining backward compatibility.

## Related Documentation

- **Schema Analysis Findings**: [/docs/schema-analysis-findings.md](/docs/schema-analysis-findings.md)
- **Implementation Summary**: [/docs/implementation-summary.md](/docs/implementation-summary.md)
- **Schema Validator Tool**: [/tools/schema-validation/enhanced-schema-validator.js](/tools/schema-validation/enhanced-schema-validator.js)

## Current State Analysis

Our schema analysis identified several inconsistencies:

### ID Field Patterns

- **legacy_entity_id**: Fields like `customerid`, `projectid` (no separator)
- **standard_foreign_key**: Fields like `employee_id`, `customer_id` (with underscore)
- **standard_id**: Simple `id` primary key
- **other**: Various non-standard patterns like `entity_id`

### Date Field Patterns

- **standard_created/updated**: `created_at`, `updated_at`
- **legacy_created**: `createdon` (no separator)
- **alternative_created**: `datecreated` (different word order)
- **domain dates**: Mix of `_date` suffix and no separator

### Status Values

- **Mixed casing**: 2 tables use lowercase, 6 tables use uppercase
- **Inconsistent values**: Different conventions across entities

## Approach: Adapter Pattern

We've implemented an adapter pattern to address these inconsistencies:

1. **Frontend standardization**: Use consistent camelCase properties in TypeScript interfaces
2. **Field mapping layer**: Map between frontend fields and database fields
3. **Database evolution**: Gradual standardization without breaking changes

## Key Components

### Field Mapping Utility

Located at `src/utils/fieldMapping.ts`, this provides:

```typescript
// Map frontend field names to database fields
export const dbFieldMap: Record<EntityType, Record<string, string>>;

// Map database field names back to frontend
export const frontendFieldMap: Record<EntityType, Record<string, string>>;

// Conversion functions
export function toDbField(entity: EntityType, fieldName: string): string;
export function toFrontendField(entity: EntityType, dbFieldName: string): string;
export function mapToDbFields<T>(entity: EntityType, data: T): Record<string, any>;
export function mapToFrontendFields<T>(entity: EntityType, data: T): Record<string, any>;

// Status value management
export function standardizeStatusValue(status: string | null | undefined): string | null;
export function prepareStatusForDb(entity: EntityType, status: string): string;
export function getStatusValuesForEntity(entity: EntityType): string[];
```

### Database Service Utility

Located at `src/utils/dbService.ts`, this provides:

```typescript
// Query building with field mapping
export function createQuery(
  entity: EntityType,
  fields?: string[],
  filters?: object,
  options?: object
);

// CRUD operations with field mapping
export async function executeQuery<T>(
  entity: EntityType,
  fields?: string[],
  filters?: object,
  options?: object
): Promise<T[]>;
export async function getById<T>(
  entity: EntityType,
  id: string,
  fields?: string[]
): Promise<T | null>;
export async function create<T>(entity: EntityType, data: Partial<T>): Promise<T>;
export async function update<T>(entity: EntityType, id: string, data: Partial<T>): Promise<T>;
export async function remove(entity: EntityType, id: string): Promise<boolean>;
export async function count(entity: EntityType, filters?: object): Promise<number>;
```

### Entity Services

We provide entity-specific services that use the database service utility:

```typescript
// Example for employees (src/services/employeeService.ts)
export async function getEmployees(filters?, options?): Promise<Employee[]>;
export async function getEmployeeById(id: string): Promise<Employee | null>;
export async function createEmployee(data: Partial<Employee>): Promise<Employee>;
export async function updateEmployee(id: string, data: Partial<Employee>): Promise<Employee>;
export async function deleteEmployee(id: string): Promise<boolean>;
export async function countEmployees(filters?): Promise<number>;
```

### Entity Interfaces

Updated to use standardized field naming:

```typescript
// Example for employees (src/types/common.ts)
export interface Employee {
  id: string; // maps to employee_id in database
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  hourlyRate?: number | null;
  status?: string | null;
  created_at?: string;
  updated_at?: string;
}
```

## Implementation Status

- ✅ Schema analysis complete
- ✅ Field mapping utilities implemented
- ✅ Database service layer created
- ✅ Employee entity updated
- ⏳ Other entities pending implementation
- ⏳ Component updates pending
- ⏳ Database evolution plan

## Database Evolution Plan

1. **Phase 1: Field Mapping Layer** (Current)

   - Implement adapter pattern
   - Update TypeScript interfaces
   - Fix component implementations

2. **Phase 2: Views & Functions** (Future)

   - Create database views for backward compatibility
   - Add utility functions for standardized access

3. **Phase 3: Schema Migration** (Future)
   - Create migration scripts
   - Update fields in small batches
   - Test compatibility at each step

## Best Practices

When working with our codebase, follow these guidelines:

1. **Always use entity services**

   - Never directly access the database
   - Use the provided service functions

2. **Use TypeScript interfaces**

   - Define proper types for all entities
   - Follow the standardized naming conventions

3. **Respect the field mapping**

   - Don't bypass the adapter layer
   - Use frontend field names consistently

4. **Status value handling**
   - Always use uppercase in code
   - Let the adapter handle database differences

## Status Value Standards

For consistency, use these standard status values in code:

- Projects: `ACTIVE`, `COMPLETED`, `PENDING`, `CANCELLED`
- Customers: `ACTIVE`, `PROSPECT`, `INACTIVE`
- Vendors/Subcontractors: `ACTIVE`, `INACTIVE`
- Work Orders: `NEW`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- Estimates: `DRAFT`, `SENT`, `APPROVED`, `REJECTED`
- Employees: `ACTIVE`, `INACTIVE`

The field mapping layer will handle transforming these values to match database expectations.
