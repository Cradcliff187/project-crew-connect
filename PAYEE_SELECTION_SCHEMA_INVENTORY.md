# Payee Selection Schema Inventory & Analysis

## 🔍 Current Issue Analysis

### Error Details

```
GET https://zrxezqllmpdlhiudutme.supabase.co/rest/v1/subcontractors?select=subid%2Csubname%2Cstatus&subname=ilike.%25%25&order=subname.asc&limit=10
400 (Bad Request)
Error: column subcontractors.subname does not exist
```

### Actual Data Structure (from console)

```javascript
// Subcontractors have these fields:
{
  company_name: 'Subcontractor 1',  // ← NOT subname!
  address: '100 Construction Avenue',
  city: 'San Francisco',
  state: 'California',
  zip: '90001'
}
```

## 📊 Schema Hierarchy

### Expense Domain Tables

```
└─ expenses
   ├─ expense_id (PK)
   ├─ payee_id      → vendors.vendorid OR subcontractors.subid
   ├─ payee_type    → 'vendor' | 'subcontractor'
   ├─ amount
   ├─ expense_date
   └─ description

└─ expense_receipts
   ├─ receipt_id (PK)
   ├─ expense_id    → expenses.expense_id
   ├─ file_url
   └─ uploaded_at
```

### Payee Domain Tables

```
└─ vendors
   ├─ vendorid (PK)
   ├─ vendorname    ✅ Correct field name
   ├─ status
   ├─ address
   └─ ...

└─ subcontractors
   ├─ subid (PK)
   ├─ company_name  ✅ Actual field name (NOT subname!)
   ├─ status
   ├─ address
   ├─ city
   ├─ state
   ├─ zip
   └─ ...
```

## 🔗 Foreign Key Relationships

1. `expenses.payee_id` → Either `vendors.vendorid` OR `subcontractors.subid`
2. `expenses.payee_type` → Determines which table to join
3. `expense_receipts.expense_id` → `expenses.expense_id`

## ❌ Column Mismatch Summary

| Table          | Expected Column | Actual Column | Status      |
| -------------- | --------------- | ------------- | ----------- |
| vendors        | vendorname      | vendorname    | ✅ OK       |
| subcontractors | subname         | company_name  | ❌ MISMATCH |

## 🎯 Root Cause

The frontend code expects `subname` but the database has `company_name`. This mismatch appears in:

- API queries
- TypeScript types
- Form fields
- Display components
