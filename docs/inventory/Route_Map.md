# Route Map

This document catalogs all the routes in the application, including their associated components, authentication requirements, and primary user actions.

## Table of Contents

- [Authentication Routes](#authentication-routes)
- [Main Application Routes](#main-application-routes)
- [User Journey Maps](#user-journey-maps)

## Authentication Routes

| Route            | Component      | Auth Required | Primary Action                             | API Endpoints Used |
| ---------------- | -------------- | ------------- | ------------------------------------------ | ------------------ |
| `/login`         | `Login`        | No            | User login through Google or other methods | Authentication API |
| `/auth/callback` | `AuthCallback` | No            | Handle OAuth callback                      | Authentication API |

## Main Application Routes

All the following routes are protected by the `RouteGuard` component, requiring authentication.

### Dashboard & Overview

| Route        | Component   | Primary Action          | API Endpoints Used     |
| ------------ | ----------- | ----------------------- | ---------------------- |
| `/` (root)   | `Dashboard` | View dashboard overview | Stats, recent activity |
| `/dashboard` | `Dashboard` | View dashboard overview | Stats, recent activity |

### Customer Management

| Route                    | Component        | Primary Action         | API Endpoints Used  |
| ------------------------ | ---------------- | ---------------------- | ------------------- |
| `/customers`             | `Customers`      | View list of customers | Customer list API   |
| `/customers/:customerId` | `CustomerDetail` | View customer details  | Customer detail API |

### Project Management

| Route                       | Component       | Primary Action        | API Endpoints Used |
| --------------------------- | --------------- | --------------------- | ------------------ |
| `/projects`                 | `Projects`      | View list of projects | Project list API   |
| `/projects/:projectId`      | `ProjectDetail` | View project details  | Project detail API |
| `/projects/:projectId/edit` | `ProjectEdit`   | Edit project details  | Project update API |

### Estimates

| Route                    | Component               | Primary Action                    | API Endpoints Used  |
| ------------------------ | ----------------------- | --------------------------------- | ------------------- |
| `/estimates`             | `Estimates`             | View list of estimates            | Estimates list API  |
| `/estimates/settings`    | `EstimateEmailSettings` | Configure estimate email settings | Settings API        |
| `/estimates/:estimateId` | `EstimateDetailPage`    | View estimate details             | Estimate detail API |

### Work Orders

| Route                       | Component         | Primary Action           | API Endpoints Used    |
| --------------------------- | ----------------- | ------------------------ | --------------------- |
| `/work-orders`              | `WorkOrders`      | View list of work orders | Work orders list API  |
| `/work-orders/:workOrderId` | `WorkOrderDetail` | View work order details  | Work order detail API |

### Contacts

| Route           | Component           | Primary Action        | API Endpoints Used |
| --------------- | ------------------- | --------------------- | ------------------ |
| `/contacts`     | `Contacts`          | View list of contacts | Contacts list API  |
| `/contacts/:id` | `ContactDetailPage` | View contact details  | Contact detail API |

### Documents

| Route        | Component   | Primary Action            | API Endpoints Used |
| ------------ | ----------- | ------------------------- | ------------------ |
| `/documents` | `Documents` | View and manage documents | Documents API      |

### Vendors & Subcontractors

| Route                              | Component             | Primary Action              | API Endpoints Used       |
| ---------------------------------- | --------------------- | --------------------------- | ------------------------ |
| `/vendors`                         | `Vendors`             | View list of vendors        | Vendors list API         |
| `/vendors/:vendorId`               | `VendorDetail`        | View vendor details         | Vendor detail API        |
| `/subcontractors`                  | `Subcontractors`      | View list of subcontractors | Subcontractors list API  |
| `/subcontractors/:subcontractorId` | `SubcontractorDetail` | View subcontractor details  | Subcontractor detail API |

### Settings & Admin

| Route        | Component       | Primary Action                 | API Endpoints Used |
| ------------ | --------------- | ------------------------------ | ------------------ |
| `/settings`  | `Settings`      | Configure application settings | Settings API       |
| `/employees` | `EmployeesPage` | Manage employees               | Employees API      |

### Time & Work Tracking

| Route            | Component      | Primary Action         | API Endpoints Used |
| ---------------- | -------------- | ---------------------- | ------------------ |
| `/time-tracking` | `TimeTracking` | Track time entries     | Time tracking API  |
| `/active-work`   | `ActiveWork`   | View active work items | Active work API    |

### Reports

| Route                       | Component       | Primary Action        | API Endpoints Used |
| --------------------------- | --------------- | --------------------- | ------------------ |
| `/reports`                  | `Reports`       | View reports          | Reports API        |
| `/report-builder`           | `ReportBuilder` | Create custom reports | Report builder API |
| `/report-builder/:reportId` | `ReportBuilder` | Edit existing reports | Report detail API  |

## User Journey Maps

### Project Management Journey

```
Login → Dashboard → Projects → Project Detail → Work Orders → Work Order Detail
   ↑                  ↓             ↓                           ↓
   └───────── Time Tracking ←───────┴───────── Documents ←──────┘
```

### Calendar & Scheduling Journey

```
Login → Dashboard → Projects → Project Detail → Schedule/Calendar → Events
   ↑                                 ↓              ↓
   └───────── Time Tracking ←────────┴── Employee Scheduling
```

### Financial Journey

```
Login → Dashboard → Estimates → Estimate Detail → Project Creation
           ↓           ↓             ↓                ↓
           └── Reports ← Work Orders ← Invoicing ← Project Detail
```
