# Payee Selection Impact Map

## 📋 Complete List of Affected Files

### 1. TypeScript Type Definitions

| File                                               | Current                   | Required Change             |
| -------------------------------------------------- | ------------------------- | --------------------------- |
| `src/integrations/supabase/types.ts`               | `subname: string \| null` | Replace with `company_name` |
| `src/components/subcontractors/types/formTypes.ts` | `subname: string`         | Replace with `company_name` |
| `src/components/subcontractors/utils/types.ts`     | `subname: string`         | Replace with `company_name` |
| `src/components/subcontractors/detail/types.ts`    | `subname: string \| null` | Replace with `company_name` |

### 2. API Query Components

| File                                                                          | Lines   | Current Query                       | Fix Required                             |
| ----------------------------------------------------------------------------- | ------- | ----------------------------------- | ---------------------------------------- |
| `src/components/estimates/components/estimate-items/VendorSearchCombobox.tsx` | 106-108 | `.select('subid, subname, status')` | `.select('subid, company_name, status')` |
|                                                                               | 107     | `.ilike('subname', ...)`            | `.ilike('company_name', ...)`            |
|                                                                               | 108     | `.order('subname', ...)`            | `.order('company_name', ...)`            |
|                                                                               | 179     | `.select('subname')`                | `.select('company_name')`                |
| `src/components/documents/vendor-selector/VendorSearchCombobox.tsx`           | 71-73   | Same as above                       | Same fixes                               |
| `src/components/documents/vendor-selector/hooks/useVendorOptions.ts`          | 43-44   | `.select('subid, subname')`         | `.select('subid, company_name')`         |
| `src/components/documents/components/EntitySelector.tsx`                      | 117     | `.select('subid, subname')`         | `.select('subid, company_name')`         |
| `src/components/changeOrders/ChangeOrderItems.tsx`                            | 88-89   | `.select('subid, subname')`         | `.select('subid, company_name')`         |

### 3. Data Mapping Components

| File                                                                          | Lines | Current                        | Fix Required                        |
| ----------------------------------------------------------------------------- | ----- | ------------------------------ | ----------------------------------- |
| `src/components/estimates/components/estimate-items/VendorSearchCombobox.tsx` | 115   | `name: item.subname`           | `name: item.company_name`           |
|                                                                               | 184   | `data?.subname`                | `data?.company_name`                |
| `src/components/documents/vendor-selector/VendorSearchCombobox.tsx`           | 80    | `name: item.subname`           | `name: item.company_name`           |
|                                                                               | 131   | `data?.subname`                | `data?.company_name`                |
| `src/components/documents/components/EntitySelector.tsx`                      | 122   | `name: s.subname \|\| s.subid` | `name: s.company_name \|\| s.subid` |

### 4. Form Components

| File                                                      | Current Field                   | Fix Required                              |
| --------------------------------------------------------- | ------------------------------- | ----------------------------------------- |
| `src/components/subcontractors/SubcontractorForm.tsx`     | `subname: initialData?.subname` | `company_name: initialData?.company_name` |
| `src/components/subcontractors/form/BasicInfoSection.tsx` | `name="subname"`                | `name="company_name"`                     |
| `src/components/subcontractors/useSubcontractorSubmit.ts` | `subname: data.subname`         | `company_name: data.company_name`         |

### 5. Display Components

| File                                                                 | Current                                  | Fix Required                                  |
| -------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `src/components/subcontractors/table/SubcontractorTableRow.tsx`      | `name={subcontractor.subname}`           | `name={subcontractor.company_name}`           |
| `src/components/subcontractors/row/SubcontractorInfo.tsx`            | `{subcontractor.subname \|\| 'Unnamed'}` | `{subcontractor.company_name \|\| 'Unnamed'}` |
| `src/components/subcontractors/detail/ContactInformationCard.tsx`    | `{subcontractor.subname}`                | `{subcontractor.company_name}`                |
| `src/components/subcontractors/detail/SubcontractorDetailHeader.tsx` | `title={subcontractor.subname}`          | `title={subcontractor.company_name}`          |

### 6. Filter & Search Components

| File                                                 | Current                             | Fix Required                             |
| ---------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| `src/components/subcontractors/utils/filterUtils.ts` | `(sub.subname?.toLowerCase()...)`   | `(sub.company_name?.toLowerCase()...)`   |
| `src/utils/reportUtils.ts`                           | `subname.ilike.%${filters.search}%` | `company_name.ilike.%${filters.search}%` |

### 7. Report & Export Components

| File                          | Current            | Fix Required            |
| ----------------------------- | ------------------ | ----------------------- |
| `src/data/reportEntities.tsx` | `field: 'subname'` | `field: 'company_name'` |
| `src/utils/fieldMapping.ts`   | `name: 'subname'`  | `name: 'company_name'`  |

### 8. Components Using Mapped Data (Already Working)

These components already map `company_name` to `subname` for compatibility:

- `src/components/estimates/components/estimate-items/useEstimateItemData.ts` ✅
- `src/components/projects/createWizard/Step2_BudgetLineItems.tsx` ✅

### 9. UI Label Changes

| Location        | Current Label   | New Label                |
| --------------- | --------------- | ------------------------ |
| Dropdown labels | "Vendor type"   | "Payee category"         |
| Options         | "Subcontractor" | "Independent contractor" |

## 🔧 Migration Strategy

### Option 1: Update Frontend (Recommended)

- Change all references from `subname` to `company_name`
- Update TypeScript types
- No database changes needed
- Faster to implement

### Option 2: Add Database Alias

```sql
-- Add a generated column
ALTER TABLE subcontractors
ADD COLUMN subname TEXT GENERATED ALWAYS AS (company_name) STORED;
```

### Option 3: Rename Database Column

```sql
-- More disruptive but cleaner
ALTER TABLE subcontractors
RENAME COLUMN company_name TO subname;
```

## 📊 Total Impact

- **Files to modify**: 25+
- **Lines affected**: ~100
- **Components affected**: 15+
- **TypeScript types**: 4 interfaces/types
- **API queries**: 6 locations

## ✅ Testing Required

1. Unit tests for updated hooks
2. E2E tests for payee selection flow
3. Verify expense creation with both vendors and subcontractors
4. Test filtering and search functionality
5. Verify report generation with updated fields

## 🚀 Implemented Solution

### Immediate Fix (Database Migration)

Created migration file: `supabase/migrations/20250111_add_subname_alias.sql`

- Adds `subname` as a generated column that mirrors `company_name`
- Maintains backward compatibility with existing frontend code
- No frontend changes required immediately
- Allows gradual migration to proper column names

### Benefits of This Approach

1. **Zero Downtime**: No breaking changes to production
2. **Gradual Migration**: Can update frontend components over time
3. **Type Safety**: Existing TypeScript types remain valid
4. **Performance**: Generated column with index for fast queries

### Next Steps

1. Deploy the migration to production
2. Verify payee selection works correctly
3. Plan gradual frontend refactoring to use `company_name`
4. Update TypeScript types when ready
5. Eventually remove the generated column after full migration
