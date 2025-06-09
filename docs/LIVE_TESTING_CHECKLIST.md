# Live Application Testing Checklist

**URL**: https://project-crew-connect-1061142868787.us-east5.run.app
**Date**: December 6, 2024
**Tester**: ******\_\_\_******

## 🔍 Browser Console Check

- [ ] Open Developer Tools (F12)
- [ ] Check Console tab for errors
- [ ] Check Network tab for failed requests
- [ ] Note any 4XX or 5XX errors below:

```
Errors found:
-
-
```

## 🧪 Test 1: Authentication

- [ ] You should be logged in already
- [ ] Check user menu shows your email
- [ ] Try signing out
- [ ] Try signing back in with Google
- [ ] Verify redirect works correctly

**Issues found**: ****************\_****************

## 🧪 Test 2: Dashboard & Navigation

- [ ] Dashboard loads without errors
- [ ] All menu items are clickable
- [ ] Check these main sections:
  - [ ] Projects
  - [ ] Work Orders
  - [ ] Employees
  - [ ] Subcontractors
  - [ ] Vendors
  - [ ] Active Work
  - [ ] Documents
  - [ ] Estimates

**Issues found**: ****************\_****************

## 🧪 Test 3: Create a Project

1. [ ] Navigate to Projects
2. [ ] Click "New Project"
3. [ ] Fill in required fields:
   - [ ] Project name
   - [ ] Address (test autocomplete)
   - [ ] Start date
   - [ ] Status
4. [ ] Submit the form
5. [ ] Verify project appears in list
6. [ ] Check if calendar event was created

**Autocomplete working?** Yes / No
**Form submission successful?** Yes / No
**Issues found**: ****************\_****************

## 🧪 Test 4: Create a Work Order

1. [ ] Navigate to Work Orders
2. [ ] Click "New Work Order"
3. [ ] Select a project
4. [ ] Fill in details
5. [ ] Submit the form
6. [ ] Verify work order appears

**Form submission successful?** Yes / No
**Issues found**: ****************\_****************

## 🧪 Test 5: Payee Selection (Known Issue Area)

1. [ ] Try to create an expense
2. [ ] Test "Vendor type" dropdown
3. [ ] Select "Independent contractor"
4. [ ] Check browser console for 400 errors
5. [ ] Document exact error message

**Error message**: ****************\_****************

## 🧪 Test 6: Employee Management

1. [ ] Navigate to Employees
2. [ ] Try to add a new employee
3. [ ] Fill in required fields
4. [ ] Submit the form
5. [ ] Verify employee appears in list

**Form submission successful?** Yes / No
**Issues found**: ****************\_****************

## 🧪 Test 7: Google Maps Integration

1. [ ] Go back to create project
2. [ ] In address field, type "123 Main"
3. [ ] Verify autocomplete suggestions appear
4. [ ] Select an address
5. [ ] Verify address details populate

**Autocomplete working?** Yes / No
**Issues found**: ****************\_****************

## 🧪 Test 8: Document Upload

1. [ ] Navigate to Documents
2. [ ] Try uploading a test file
3. [ ] Verify upload completes
4. [ ] Check if file appears in list

**Upload successful?** Yes / No
**Issues found**: ****************\_****************

## 📊 Summary

### Working Features:

- [ ] Authentication
- [ ] Dashboard
- [ ] Projects
- [ ] Work Orders
- [ ] Employees
- [ ] Maps Autocomplete
- [ ] Document Upload
- [ ] Other: ******\_\_\_******

### Broken Features:

- [ ] Payee selection (known)
- [ ] Other: ******\_\_\_******
- [ ] Other: ******\_\_\_******

### Critical Issues:

1. ***
2. ***
3. ***

### Next Steps:

- [ ] Fix payee selection 400 error
- [ ] Address other critical issues
- [ ] Run E2E tests locally
