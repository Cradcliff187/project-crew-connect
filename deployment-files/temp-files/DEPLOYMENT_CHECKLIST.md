# Deployment Checklist

## 🚀 Pre-Deployment Verification

### 1. Code Review

- [x] All TypeScript errors resolved
- [x] Console logs cleaned up (fixed "Processed form data: undefined")
- [x] Components tested locally
- [x] No breaking changes to existing functionality

### 2. Database Migration

- [ ] Review migration SQL:

  ```sql
  -- supabase/migrations/20250111_add_subname_alias.sql
  ALTER TABLE subcontractors
  ADD COLUMN IF NOT EXISTS subname TEXT GENERATED ALWAYS AS (company_name) STORED;

  CREATE INDEX IF NOT EXISTS idx_subcontractors_subname ON subcontractors (subname);

  COMMENT ON COLUMN subcontractors.subname IS
  'Generated alias for company_name to maintain backward compatibility with frontend code';
  ```

- [ ] Test migration on staging database (if available)
- [ ] Backup production database

## 📋 Deployment Steps

### Step 1: Deploy Code Changes

- [ ] Commit all changes to Git
- [ ] Push to remote repository
- [ ] Trigger deployment pipeline
- [ ] Verify deployment completed successfully

### Step 2: Apply Database Migration

1. [ ] Login to Supabase Dashboard
2. [ ] Navigate to SQL Editor
3. [ ] Run the migration SQL
4. [ ] Verify migration succeeded
5. [ ] Check that subname column exists

### Step 3: Verify Payee Selection Fix

1. [ ] Navigate to expense creation form
2. [ ] Select "Independent Contractor" as payee category
3. [ ] Verify dropdown loads without errors
4. [ ] Test search functionality
5. [ ] Create a test expense with subcontractor

### Step 4: Verify Calendar Integration UI

1. [ ] Navigate to Project > Schedule tab
2. [ ] Create a new schedule item
3. [ ] Verify sync status badge appears
4. [ ] Test manual sync button
5. [ ] Check error handling (disconnect calendar and try sync)

### Step 5: Verify UI Label Updates

1. [ ] Check "Vendor Type" changed to "Payee Category"
2. [ ] Check "Subcontractor" changed to "Independent Contractor"
3. [ ] Verify labels in all relevant forms

## 🧪 Post-Deployment Testing

### Run Browser Test Suite

```javascript
// In browser console:
// 1. Copy contents of test-implementation.js
// 2. Paste in console
// 3. Run: window.akcTestSuite.runAllTests()
```

### Manual Testing Checklist

- [ ] **Payee Selection**

  - [ ] Create expense with vendor
  - [ ] Create expense with independent contractor
  - [ ] Edit existing expense
  - [ ] Search for vendors/contractors

- [ ] **Calendar Integration**

  - [ ] Create schedule item with calendar sync
  - [ ] Edit schedule item
  - [ ] Manual sync existing item
  - [ ] Delete schedule item (verify calendar event removed)

- [ ] **Form Processing**
  - [ ] Verify no "undefined" console logs
  - [ ] Check form validation works
  - [ ] Verify data saves correctly

## 🔍 Monitoring

### Check for Errors

1. [ ] Monitor browser console for errors
2. [ ] Check Supabase logs for database errors
3. [ ] Monitor server logs for API errors

### Performance Checks

1. [ ] Verify page load times haven't increased
2. [ ] Check that subcontractor queries are performant
3. [ ] Ensure calendar sync doesn't timeout

## 📊 Success Metrics

### Immediate (First 24 hours)

- [ ] Zero 400 errors for subcontractor selection
- [ ] Calendar sync success rate > 95%
- [ ] No increase in error logs
- [ ] User reports indicate improvements

### Week 1

- [ ] Adoption of calendar sync feature
- [ ] Reduction in support tickets for payee selection
- [ ] Positive user feedback

## 🚨 Rollback Plan

If critical issues arise:

1. **For Database Changes**:

   ```sql
   -- Remove the generated column
   ALTER TABLE subcontractors DROP COLUMN IF EXISTS subname;
   DROP INDEX IF EXISTS idx_subcontractors_subname;
   ```

2. **For Code Changes**:
   - Revert to previous deployment
   - Or deploy hotfix reverting specific components

## ✅ Sign-Off

- [ ] Development Team
- [ ] QA/Testing
- [ ] Product Owner
- [ ] Deployment Complete

**Deployment Date**: ******\_\_\_******
**Deployed By**: ******\_\_\_******
**Version**: ******\_\_\_******
