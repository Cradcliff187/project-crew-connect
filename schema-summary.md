# Supabase Database Schema Summary

## Tables

### customers

| Column | Type | Sample Values | Notes |
|--------|------|--------------|-------|
| customerid | date | `CUS-100001`, `CUS-100002`, `CUS-100003` | Possible FK to customer |
| customername | string | `Oakridge Properties`, `Westview Development`, `Highland Construction` |  |
| address | string | `123 Main Street`, `456 Market Street`, `789 Highland Ave` |  |
| city | string | `San Francisco`, `Los Angeles`, `San Diego` |  |
| state | string | `California`, `California`, `California` |  |
| zip | date | `94105`, `90001`, `92101` |  |
| contactemail | string | `contact@oakridge.com`, `info@westview.dev`, `projects@highland.build` |  |
| phone | string | `(555) 123-4567`, `(555) 234-5678`, `(555) 345-6789` |  |
| createdon | unknown | No samples |  |
| createdby | string | `system`, `system`, `system` |  |
| status | string | `ACTIVE`, `ACTIVE`, `PROSPECT` |  |
| created_at | date | `2025-03-22T19:59:35.211194+00:00`, `2025-03-22T19:59:35.211194+00:00`, `2025-03-22T19:59:35.211194+00:00` |  |
| updated_at | date | `2025-03-22T19:59:35.211194+00:00`, `2025-03-22T19:59:35.211194+00:00`, `2025-03-22T19:59:35.211194+00:00` |  |

### employees

| Column | Type | Sample Values | Notes |
|--------|------|--------------|-------|
| employee_id | uuid | `87c41b6e-9c05-45a7-b8e2-749b834183bc`, `f2ce8446-9798-4844-bb33-6816b5517903`, `bc2aad1f-183e-4290-9e89-7799b5509989` | Possible FK to employee |
| first_name | string | `John`, `Jane`, `John` |  |
| last_name | string | `Doe`, `Smith`, `Smith` |  |
| email | string | `john.doe@company.com`, `jane.smith@company.com`, `john.smith@akc.com` |  |
| phone | string | `555-1111`, `555-2222`, `(555) 111-2233` |  |
| role | string | `Project Manager`, `Developer`, `Project Manager` |  |
| hourly_rate | number | `50`, `40`, `85` |  |
| status | string | `ACTIVE`, `ACTIVE`, `ACTIVE` |  |
| created_at | date | `2025-03-17T20:30:58.529052+00:00`, `2025-03-17T20:30:58.529052+00:00`, `2025-03-22T19:59:35.211194+00:00` |  |
| updated_at | date | `2025-03-17T20:30:58.529052+00:00`, `2025-03-17T20:30:58.529052+00:00`, `2025-03-22T19:59:35.211194+00:00` |  |

## Potential Relationships

| From Table | From Column | To Table | To Column | Type |
|------------|-------------|----------|-----------|------|
| customers | customerid | customer | id | many_to_one |
| employees | employee_id | employee | id | many_to_one |
