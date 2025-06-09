# Payee Selection Fix Summary

## ✅ What We've Done

### 1. **Identified the Issue**

- Error: `column subcontractors.subname does not exist`
- Frontend expects `subname` but database has `company_name`
- Affects expense creation when selecting "Independent contractor" as payee type

### 2. **Created Comprehensive Documentation**

- `PAYEE_SELECTION_SCHEMA_INVENTORY.md` - Complete schema analysis
- `PAYEE_SELECTION_IMPACT_MAP.md` - All affected files (25+ files, 100+ lines)
- Added to `GOOGLE_CALENDAR_INTEGRATION_TODO.md` priority projects

### 3. **Created Database Migration**

- File: `supabase/migrations/20250111_add_subname_alias.sql`
- Adds `subname` as a generated column that mirrors `company_name`
- Includes index for performance
- Zero downtime solution

## 🚀 Next Steps to Deploy

### Option 1: Apply Migration via Supabase Dashboard

1. Go to Supabase Dashboard > SQL Editor
2. Run the migration:

```sql
-- Add subname as a generated column alias for company_name
ALTER TABLE subcontractors
ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;

-- Create index on the generated column
CREATE INDEX IF NOT EXISTS idx_subcontractors_subname ON subcontractors (subname);

-- Add comment
COMMENT ON COLUMN subcontractors.subname IS 'Generated alias for company_name to maintain backward compatibility';
```

### Option 2: Apply via Supabase CLI

1. Fix the `.env` file issue (seems to have null characters)
2. Run `npx supabase link --project-ref zrxezqllmpdlhiudutme`
3. Run `npx supabase db push`

## 🧪 Testing After Deployment

1. Go to expense creation form
2. Select "Independent contractor" as payee type
3. Search should now work without 400 errors
4. Verify subcontractors appear in dropdown

## 📋 Long-term Plan

1. **Phase 1** (Immediate): Deploy the migration ✅
2. **Phase 2** (Later): Update TypeScript types to include both `subname` and `company_name`
3. **Phase 3** (Future): Gradually update frontend to use `company_name`
4. **Phase 4** (Final): Remove the generated `subname` column

## 🎯 Benefits

- **Zero Breaking Changes**: Production continues working
- **Immediate Fix**: Resolves the 400 error
- **Future-Proof**: Allows gradual migration
- **Performance**: Indexed column for fast queries
