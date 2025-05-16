# Database Schema Summary

This document provides a summary of the database schema for the application, including tables, columns, relationships, and data access patterns.

## Table of Contents

- [Core Entity Tables](#core-entity-tables)
- [Relationship Tables](#relationship-tables)
- [Key Database Features](#key-database-features)
- [Data Model Recommendations](#data-model-recommendations)

## Core Entity Tables

### Customers

The `customers` table stores information about the businesses or individuals that are clients of the company.

**Table: `customers`**

| Column         | Type      | Description                       | Notes               |
| -------------- | --------- | --------------------------------- | ------------------- |
| `customerid`   | string    | Primary key (e.g., "CUS-100001")  | Custom ID format    |
| `customername` | string    | Name of the customer              | -                   |
| `address`      | string    | Street address                    | -                   |
| `city`         | string    | City                              | -                   |
| `state`        | string    | State/province                    | -                   |
| `zip`          | string    | Postal/zip code                   | -                   |
| `contactemail` | string    | Primary contact email             | -                   |
| `phone`        | string    | Contact phone number              | -                   |
| `createdon`    | timestamp | Date record created               | -                   |
| `createdby`    | string    | User who created the record       | Often "system"      |
| `status`       | string    | Current status (ACTIVE, PROSPECT) | Enum-like values    |
| `created_at`   | timestamp | Timestamp of creation             | Managed by Supabase |
| `updated_at`   | timestamp | Timestamp of last update          | Managed by Supabase |

**Sample Data:**

```json
{
  "customerid": "CUS-100001",
  "customername": "Oakridge Properties",
  "address": "123 Main Street",
  "city": "San Francisco",
  "state": "California",
  "zip": "94105",
  "contactemail": "contact@oakridge.com",
  "phone": "(555) 123-4567",
  "createdon": null,
  "createdby": "system",
  "status": "ACTIVE",
  "created_at": "2025-03-22T19:59:35.211194+00:00",
  "updated_at": "2025-03-22T19:59:35.211194+00:00"
}
```

### Employees

The `employees` table stores information about the company's staff members.

**Table: `employees`**

| Column        | Type      | Description                     | Notes               |
| ------------- | --------- | ------------------------------- | ------------------- |
| `employee_id` | uuid      | Primary key                     | UUID format         |
| `first_name`  | string    | First name                      | -                   |
| `last_name`   | string    | Last name                       | -                   |
| `email`       | string    | Email address                   | -                   |
| `phone`       | string    | Contact phone number            | Various formats     |
| `role`        | string    | Job title/role                  | -                   |
| `hourly_rate` | numeric   | Hourly rate for billing/payroll | -                   |
| `status`      | string    | Current employment status       | Typically "ACTIVE"  |
| `created_at`  | timestamp | Timestamp of creation           | Managed by Supabase |
| `updated_at`  | timestamp | Timestamp of last update        | Managed by Supabase |

**Sample Data:**

```json
{
  "employee_id": "87c41b6e-9c05-45a7-b8e2-749b834183bc",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@company.com",
  "phone": "555-1111",
  "role": "Project Manager",
  "hourly_rate": 50,
  "status": "ACTIVE",
  "created_at": "2025-03-17T20:30:58.529052+00:00",
  "updated_at": "2025-03-17T20:30:58.529052+00:00"
}
```

## Additional Tables (Inferred)

Based on the application codebase and relationships, the following tables likely exist but aren't fully documented in the schema discovery:

### Projects

**Table: `projects`** (inferred)

The core entity that represents construction or development projects.

| Column        | Type        | Description              | Notes |
| ------------- | ----------- | ------------------------ | ----- |
| `project_id`  | string/uuid | Primary key              | -     |
| `title`       | string      | Project title            | -     |
| `customer_id` | string      | Foreign key to customers | -     |
| `status`      | string      | Project status           | -     |
| `start_date`  | date        | Project start date       | -     |
| `end_date`    | date        | Projected end date       | -     |
| `created_at`  | timestamp   | Timestamp of creation    | -     |
| `updated_at`  | timestamp   | Timestamp of last update | -     |

### Work Orders

**Table: `work_orders`** (inferred)

Represents specific jobs or tasks within a project.

| Column         | Type        | Description              | Notes |
| -------------- | ----------- | ------------------------ | ----- |
| `workorder_id` | string/uuid | Primary key              | -     |
| `project_id`   | string/uuid | Foreign key to projects  | -     |
| `title`        | string      | Work order title         | -     |
| `description`  | text        | Details of the work      | -     |
| `status`       | string      | Current status           | -     |
| `assigned_to`  | uuid        | Employee assigned        | -     |
| `created_at`   | timestamp   | Timestamp of creation    | -     |
| `updated_at`   | timestamp   | Timestamp of last update | -     |

### Estimates

**Table: `estimates`** (inferred)

Cost estimates for projects or work.

| Column         | Type        | Description              | Notes |
| -------------- | ----------- | ------------------------ | ----- |
| `estimate_id`  | string/uuid | Primary key              | -     |
| `customer_id`  | string      | Foreign key to customers | -     |
| `title`        | string      | Estimate title           | -     |
| `total_amount` | numeric     | Total estimated amount   | -     |
| `status`       | string      | Current status           | -     |
| `created_at`   | timestamp   | Timestamp of creation    | -     |
| `updated_at`   | timestamp   | Timestamp of last update | -     |

## Relationship Tables

### Many-to-Many Relationships

The following junction tables are inferred from the application structure:

1. **project_employees** - Links employees to projects they work on
2. **project_documents** - Associates documents with projects
3. **workorder_timelog** - Records time entries for work orders

## Key Database Features

### Identity and Authentication

- Supabase Auth management for user authentication
- Custom roles for access control
- Session-based authorization

### RLS (Row Level Security)

The database likely employs Row Level Security policies to restrict data access based on the authenticated user.

### Triggers

Automated triggers for:

- Updating timestamps (`created_at`, `updated_at`)
- Audit logging
- Status transitions

## Data Model Recommendations

1. **Consistency in Primary Keys**: Standardize on either UUIDs or custom string IDs
2. **Foreign Key Constraints**: Ensure referential integrity across all tables
3. **Standardized Status Enums**: Use PostgreSQL enums for status fields
4. **JSON Extensions**: Consider using JSONB for flexible metadata storage
5. **Text Search**: Implement PostgreSQL full-text search capabilities
