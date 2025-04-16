# Data Schema Alignment for Reports

## Current Issues

Based on our analysis, we've identified the following data schema inconsistencies in the reports section:

1. **Employee Representation Inconsistencies**:

   - In Supabase, employees have `first_name` and `last_name` as separate fields
   - In reports, a derived `full_name` field is used (doesn't exist in database)
   - Different components use inconsistent employee interfaces

2. **Time Entry Related Issues**:

   - Time entries have employee relationship via `employee_id` foreign key
   - The front-end often needs to join and transform data to show employee names
   - Some components use `employee_name` (derived) while others join tables directly

3. **Field Type and Format Inconsistencies**:
   - Some date fields use different formats in different places
   - Different components use different field access patterns for the same data

## Implementation Plan

### 1. Standardize Employee Type Definition

Create a single, comprehensive `Employee` interface that matches the Supabase schema:

```typescript
// src/types/common.ts
export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  hourly_rate?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// Add a helper function for displaying full names
export function getEmployeeFullName(employee?: Employee | null): string {
  if (!employee) return 'Unassigned';
  return `${employee.first_name} ${employee.last_name}`;
}
```

### 2. Update Report Entity Field Definitions

Modify the employee field definitions in the reports section to match the database schema:

```typescript
// src/data/reportEntities.tsx
export const entityFields: Record<EntityType, FieldDefinition[]> = {
  // Other entities...

  employees: [
    { label: 'First Name', field: 'first_name', type: 'text' },
    { label: 'Last Name', field: 'last_name', type: 'text' },
    { label: 'Email', field: 'email', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Role', field: 'role', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Hourly Rate', field: 'hourly_rate', type: 'currency' },
    { label: 'Created Date', field: 'created_at', type: 'date' },
  ],
};
```

### 3. Update Report Data Processing Functions

Modify the `processEntityData` function to handle display formatting without modifying the data structure:

```typescript
// src/utils/reportUtils.ts
export const processEntityData = (entityType: EntityType, data: any[]): any[] => {
  return data.map(item => {
    const processed = { ...item };

    // Keep specific calculations for other entity types...

    // Remove the employee full_name field transformation
    // It will be handled by the presentation layer

    return processed;
  });
};
```

### 4. Add Display Formatters for Reports

Create a formatter function that can be used in the presentation layer:

```typescript
// src/utils/reportUtils.ts
export const formatEmployeeName = (employee: any): string => {
  if (!employee) return 'Unassigned';
  if (employee.first_name && employee.last_name) {
    return `${employee.first_name} ${employee.last_name}`;
  }
  return employee.employee_id || 'Unknown';
};
```

### 5. Update Table Column Definitions

Update the table column generators to use formatters without modifying the data structure:

```typescript
// src/utils/reportUtils.ts
export const generateTableColumns = (fields: FieldDefinition[]) => {
  return fields.map(field => ({
    accessorKey: field.field,
    header: field.label,
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(field.field);

      // Format the value based on its type
      if (value === null || value === undefined) {
        return '—';
      }

      // Special handling for employee-related columns
      if (field.entity === 'employees' && field.field === 'employee_id') {
        // Get the employee from the row data if available
        const employee = row.original.employees;
        return formatEmployeeName(employee);
      }

      // Other formatting logic...
    },
  }));
};
```

### 6. Update Time Entry Components

Update time entry components to use the standardized Employee interface:

```typescript
// src/components/timeTracking/TimeEntryList.tsx
// Change this:
const [employeeMap, setEmployeeMap] = useState<{ [key: string]: string }>({});

// To this:
const [employeeMap, setEmployeeMap] = useState<{ [key: string]: Employee }>({});

// And update the fetch logic:
const employeeNameMap = data.reduce(
  (acc, emp) => {
    acc[emp.employee_id] = emp;
    return acc;
  },
  {} as { [key: string]: Employee }
);

// Update the display function:
const getEmployeeName = (employeeId: string | undefined | null): string => {
  if (!employeeId) return 'Unassigned';
  const employee = employeeMap[employeeId];
  return employee ? getEmployeeFullName(employee) : 'Unknown';
};
```

### 7. Update CSV Export Functions

Ensure CSV exports use the same formatting logic:

```typescript
// src/hooks/useReportOptions.ts
const exportToCsv = (data: any[], fields: any[]) => {
  // ...existing code...

  // Map the data
  const csvData = data.map((item: any) => {
    return fields.map(field => {
      const value = item[field.field];

      // Special handling for employee name
      if (field.entity === 'employees' && field.field === 'employee_id') {
        return formatEmployeeName(item.employees);
      }

      // Other formatting logic...
    });
  });

  // ...rest of the export logic...
};
```

## Implementation Status

### Completed Changes:

1. ✅ **Standardized Employee Interface**:

   - Updated `src/types/common.ts` with a comprehensive Employee interface
   - Added a consistent `getEmployeeFullName()` helper function

2. ✅ **Updated Employee Field Definitions in Reports**:

   - Modified `src/data/reportEntities.tsx` to use actual database fields
   - Removed derived `full_name` field that wasn't in the database

3. ✅ **Improved Data Processing**:

   - Updated `src/utils/reportUtils.ts` to remove data transformations
   - Added `formatEmployeeName()` helper function for presentation formatting

4. ✅ **Updated Table Column Display Logic**:

   - Added special handling for employee fields in `generateTableColumns()`
   - Now handles joined employee data correctly

5. ✅ **Updated Time Entry Components**:

   - Fixed `TimeEntryList.tsx` to use standardized Employee interface
   - Updated `TimeEntryForm.tsx` and `EmployeeSelect.tsx` for consistency
   - Ensured all components use the same `getEmployeeFullName()` function

6. ✅ **Added CSV Export Handling**:
   - Updated CSV export function to format employee data consistently

### Next Steps:

1. **Testing**:

   - Test reports with employees to ensure correct display
   - Verify time entries with employee assignments
   - Test CSV exports of reports with employee data

2. **Additional Components**:
   - Review and update other components that might use employee data

## Testing Plan

1. **Validate Database Schema**:

   - Run the schema validator against the live Supabase database
   - Ensure all fields used in reports match the database schema

2. **Test Reports with Sample Data**:

   - Generate reports for each entity type
   - Verify that employee data is displayed correctly
   - Check that filters and sorting work as expected

3. **Test Time Entry Components**:

   - Create and edit time entries with employee assignments
   - Verify relationships are maintained
   - Check that employee names display correctly

4. **Validate CSV Exports**:
   - Export data for each report type
   - Verify that employee-related fields are formatted correctly

## Benefits

1. **Improved Data Consistency**: All components will use the same employee data structure
2. **Better Type Safety**: TypeScript will provide better type checking
3. **Simplified Maintenance**: Fewer transformations between database and UI
4. **Enhanced Performance**: Fewer data manipulations at runtime
5. **Accurate Reports**: More reliable reporting with direct database field mapping
