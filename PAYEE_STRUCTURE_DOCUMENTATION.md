# AKC CRM Payee Structure Documentation

## Overview

This document defines the proper structure and terminology for payees in the AKC CRM system.

## Payee Hierarchy

```
Payee (Top-level concept)
├── Vendor (Type of payee)
│   └── Examples: Material suppliers, equipment rental companies
└── Subcontractor/Independent Contractor (Type of payee)
    └── Examples: Electricians, plumbers, specialized trades
```

## Database Schema

### vendors table

- **Primary Key**: `vendorid`
- **Name Field**: `vendorname`
- **Type**: Regular vendors/suppliers

### subcontractors table

- **Primary Key**: `subid`
- **Name Fields**:
  - `company_name` (actual database column)
  - `subname` (generated alias column for backward compatibility)
- **Type**: Independent contractors/specialized trades

## Migration Applied

On January 11, 2025, we applied a migration that adds `subname` as a generated column:

```sql
ALTER TABLE subcontractors
ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;

CREATE INDEX IF NOT EXISTS idx_subcontractors_subname ON subcontractors (subname);
```

This ensures backward compatibility while we gradually update the frontend code.

## UI Terminology

### Forms and Labels

- **Field Label**: "Payee Category" (not "Vendor Type")
- **Options**:
  - "Vendor" - For regular suppliers/vendors
  - "Independent Contractor" - For subcontractors (not "Subcontractor")
  - "Other" - For miscellaneous payees

### Example Usage in Forms

```tsx
<FormLabel>Payee Category</FormLabel>
<Select>
  <SelectItem value="vendor">Vendor</SelectItem>
  <SelectItem value="subcontractor">Independent Contractor</SelectItem>
  <SelectItem value="other">Other</SelectItem>
</Select>
```

## Expense Type Relations

Different expense types have specific payee requirements:

```javascript
const EXPENSE_TYPE_RELATIONS = {
  material: { requiresVendor: true, allowsSubcontractor: false },
  equipment: { requiresVendor: true, allowsSubcontractor: false },
  labor: { requiresVendor: false, allowsSubcontractor: true },
  subcontractor: { requiresVendor: false, allowsSubcontractor: true },
  // ... etc
};
```

## API Usage

### Searching for Vendors

```javascript
const { data } = await supabase
  .from('vendors')
  .select('vendorid, vendorname')
  .ilike('vendorname', `%${searchTerm}%`)
  .order('vendorname');
```

### Searching for Subcontractors

```javascript
// Using company_name (preferred)
const { data } = await supabase
  .from('subcontractors')
  .select('subid, company_name')
  .ilike('company_name', `%${searchTerm}%`)
  .order('company_name');

// Using subname (backward compatibility)
const { data } = await supabase
  .from('subcontractors')
  .select('subid, subname')
  .ilike('subname', `%${searchTerm}%`)
  .order('subname');
```

## Component Structure

### VendorTypeSelector Component

- Controls the payee category selection
- Updates to use "Payee Category" label
- Options: Vendor, Independent Contractor, Other

### VendorSearchCombobox Component

- Dynamically searches based on selected payee category
- Handles both vendors and subcontractors
- Uses appropriate name field for each type

## Best Practices

1. **Always use "Payee" as the umbrella term** when referring to both vendors and subcontractors
2. **Use "Independent Contractor"** in UI instead of "Subcontractor"
3. **Prefer `company_name`** over `subname` when updating code
4. **Maintain backward compatibility** until all components are updated

## Migration Path

### Phase 1 (Completed) ✅

- Added `subname` as generated column
- Fixed immediate payee selection issues

### Phase 2 (In Progress)

- Update UI labels throughout application
- Ensure all components use correct terminology

### Phase 3 (Future)

- Gradually update all code to use `company_name`
- Remove dependency on `subname` alias
- Eventually drop the generated column

## Testing Checklist

- [ ] Expense form payee selection works for vendors
- [ ] Expense form payee selection works for independent contractors
- [ ] Search functionality returns correct results
- [ ] UI shows "Payee Category" not "Vendor Type"
- [ ] Options show "Independent Contractor" not "Subcontractor"
- [ ] All related forms maintain selected values correctly

## Related Files

- `/src/components/documents/vendor-selector/` - Payee selection components
- `/src/components/subcontractors/` - Subcontractor management
- `/src/components/vendors/` - Vendor management
- `/src/constants/expenseTypes.ts` - Expense type relations
- `/supabase/migrations/20250111_add_subname_alias.sql` - Migration file
