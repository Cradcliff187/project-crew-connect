# Post-Deployment TODO List

## ✅ Completed Issues

- [x] Fixed Cloud Run deployment (container was failing to start)
- [x] Fixed OAuth redirect URLs (was using old URL)
- [x] Enabled public access to the service
- [x] Updated deployment documentation with correct region (us-east5)
- [x] Fixed Supabase authentication integration

## Live Application Details

- **URL**: https://project-crew-connect-1061142868787.us-east5.run.app
- **Region**: us-east5
- **Status**: ✅ Running and accessible

## 🚀 Immediate Testing Tasks

### 1. Test Core Features

- [ ] Create a new project
- [ ] Create a work order
- [ ] Add employees
- [ ] Test basic CRUD operations

### 2. Check Google Calendar Integration

- [ ] Create a project and verify calendar event creation
- [ ] Create a work order and check calendar
- [ ] Verify calendar IDs in secrets match actual calendars

### 3. Test Maps Autocomplete

- [ ] Test address search in project creation
- [ ] Verify autocomplete suggestions appear
- [ ] Check if place details are retrieved correctly

### 4. Review Error Logs

- [ ] Check Cloud Run logs for runtime errors
- [ ] Monitor browser console for client-side errors
- [ ] Document any 4XX or 5XX errors

---

## 🔧 Priority Project: Payee-Selection & Expense-Tracking Flow Fix

### Context / Known Issues

1. **400 Error**: Selecting "Independent contractor" triggers `GET /rest/v1/subcontractors?select=subid,subname,status...` → 400 (Postgres 42703) - `subname` column doesn't exist
2. **Misleading Labels**: "Vendor type" label is inconsistent with Supabase schema
3. **Broken References**: Receipt-upload & expense records depend on mismatched columns

### Deliverables

#### 1. Schema Alignment

- [ ] Audit `vendors` & `subcontractors` tables for column consistency
- [ ] Ensure both tables expose a common `name` field (column or view/alias)
- [ ] Create migration SQL if renames/additions needed

#### 2. API Refactor

- [ ] Update Supabase queries to use `select=id,name,status`
- [ ] Remove `subname` references and empty `ilike` filter
- [ ] Add defensive checks for blank search terms

#### 3. UI/UX Changes

- [ ] Rename dropdown label from "Vendor type" to "Payee category"
- [ ] Update options: "Company vendor" ↔ `vendors`, "Independent contractor" ↔ `subcontractors`
- [ ] Implement autocomplete from unified `name` field
- [ ] Add toast notifications on fetch failures

#### 4. Expense & Upload Flows

- [ ] Store `payee_id` + `payee_category` in expense records
- [ ] Link receipt-upload to chosen payee
- [ ] Update TypeScript types accordingly

#### 5. Testing & Validation

- [ ] Create unit tests for new API hooks
- [ ] Add E2E tests: select payee types, upload receipts, verify DB writes
- [ ] Ensure zero console errors

### Pre-Work Analysis Required

#### A. Schema Inventory

- [ ] Run schema introspection query
- [ ] Create hierarchy trees for expense and payee domains
- [ ] Document all foreign-key relationships
- [ ] Deliver tree BEFORE migrations

#### B. Impact Map

- [ ] List all affected files/modules
- [ ] Document required changes per file
- [ ] Include migrations, seeds, fixtures, tests

### Success Criteria

- ✅ No 400 errors when selecting payees
- ✅ Expense & upload flows link correctly
- ✅ All tests pass in CI
- ✅ Schema and impact map approved

---

## 🔧 Other Issues to Address

### 1. Security & Authentication

- [ ] Review and test role-based access control (admin vs field_user)
- [ ] Verify all protected routes require authentication
- [ ] Test session persistence and refresh token handling

### 2. Google Calendar Integration

- [ ] Test creating projects with calendar events
- [ ] Verify work order calendar integration
- [ ] Check if calendar IDs in secrets are correct

### 3. Google Maps Integration

- [ ] Verify autocomplete is working in production
- [ ] Test place details API endpoint
- [ ] Check API key restrictions/quotas

### 4. Database & Supabase

- [ ] Test all CRUD operations
- [ ] Verify RLS (Row Level Security) policies
- [ ] Check for any missing database migrations

### 5. Performance & Optimization

- [ ] Review Cloud Run scaling settings
- [ ] Check for any slow API endpoints
- [ ] Monitor memory usage

### 6. Error Handling

- [ ] Test error boundaries
- [ ] Verify proper error messages to users
- [ ] Check logging for debugging

### 7. UI/UX Issues

- [ ] Test responsive design on mobile
- [ ] Verify all forms work correctly
- [ ] Check for any broken links or images

### 8. DevOps & Monitoring

- [ ] Set up monitoring alerts
- [ ] Configure backup strategy
- [ ] Document deployment process

## Notes

- Work on this branch: `feature/post-deployment-fixes`
- Test changes locally before pushing
- Each fix should be a separate commit
- Create PR when ready to merge to main
