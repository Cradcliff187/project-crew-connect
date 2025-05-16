# Components Inventory

This document catalogs the React components used throughout the application, along with their purpose, props, and dependencies.

## Table of Contents

- [Layout Components](#layout-components)
- [Auth Components](#auth-components)
- [Common Components](#common-components)
- [Feature Components](#feature-components)
- [UI Components](#ui-components)

## Layout Components

| Component        | Purpose                                | Props                                                             | Dependencies                                        | Last Modified |
| ---------------- | -------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- | ------------- |
| `Layout`         | Main application layout wrapper        | `children: ReactNode`                                             | `AppSidebar`, `Header`, `Outlet`, `SidebarProvider` | -             |
| `AppSidebar`     | Navigation sidebar                     | -                                                                 | `Sidebar`, `SidebarContent`, various icons          | -             |
| `Header`         | Application header                     | -                                                                 | -                                                   | -             |
| `PageHeader`     | Page title and description component   | `title: string, description?: string, children?: React.ReactNode` | React                                               | -             |
| `PageTransition` | Animation wrapper for page transitions | `children: React.ReactNode`                                       | `framer-motion`                                     | -             |

## Auth Components

| Component      | Purpose                                     | Props                 | Dependencies                         | Last Modified |
| -------------- | ------------------------------------------- | --------------------- | ------------------------------------ | ------------- |
| `RouteGuard`   | Protects routes from unauthenticated access | `children: ReactNode` | `useAuth`, `Navigate`, `useLocation` | -             |
| `Login`        | Login page component                        | -                     | -                                    | -             |
| `AuthCallback` | OAuth callback handler                      | -                     | -                                    | -             |

## Common Components

| Component           | Purpose                        | Props                                                                                                      | Dependencies | Last Modified |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------ | ------------- |
| `StatusHistoryView` | Displays status change history | `history: StatusHistoryEntry[], statusOptions: StatusOption[], currentStatus: string, showEmpty?: boolean` | -            | -             |

## Feature Components

### Projects

| Component       | Purpose                            | Props | Dependencies | Last Modified |
| --------------- | ---------------------------------- | ----- | ------------ | ------------- |
| `ProjectDetail` | Project details page               | -     | -            | -             |
| `ProjectEdit`   | Project editing form               | -     | -            | -             |
| `ProjectForm`   | Form for creating/editing projects | -     | -            | -             |

### Work Orders

| Component               | Purpose                       | Props                                              | Dependencies             | Last Modified |
| ----------------------- | ----------------------------- | -------------------------------------------------- | ------------------------ | ------------- |
| `WorkOrderDetail`       | Work order details page       | -                                                  | -                        | -             |
| `WorkOrderDetailHeader` | Header for work order details | `workOrder: WorkOrder, onStatusChange: () => void` | `WorkOrderStatusControl` | -             |
| `TotalHoursDisplay`     | Displays total hours          | `totalHours: number`                               | `Clock` icon             | -             |

### Estimates

| Component              | Purpose                     | Props                                                                             | Dependencies | Last Modified |
| ---------------------- | --------------------------- | --------------------------------------------------------------------------------- | ------------ | ------------- |
| `EstimateDetailLayout` | Layout for estimate details | `sidebar: ReactNode, main: ReactNode, compact?: boolean`                          | React        | -             |
| `SummaryItem`          | Item in estimate summary    | `label: string, value: React.ReactNode, isBold?: boolean, hasBorderTop?: boolean` | React        | -             |

### Documents

| Component                   | Purpose                                | Props                                                                                                                                                                                                                                                                                             | Dependencies                               | Last Modified |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------- |
| `DocumentValidationUtility` | Validates document integrity           | `document: Document`                                                                                                                                                                                                                                                                              | UI components                              | -             |
| `EnhancedDocumentUpload`    | Document upload with enhanced features | -                                                                                                                                                                                                                                                                                                 | -                                          | -             |
| `DocumentUploadDirectSheet` | Sheet for uploading documents          | `open: boolean, onOpenChange: (open: boolean) => void, entityType?: string, entityId?: string, onSuccess?: (documentId?: string) => void, onCancel?: () => void, title?: string, description?: string, isReceiptUploadOnly?: boolean, showHelpText?: boolean, allowEntityTypeSelection?: boolean` | Sheet components, `EnhancedDocumentUpload` | -             |

### Time Tracking

| Component     | Purpose                        | Props                                                                              | Dependencies | Last Modified |
| ------------- | ------------------------------ | ---------------------------------------------------------------------------------- | ------------ | ------------- |
| `FormSection` | Section in time tracking forms | `label: string, children: ReactNode, optional?: boolean, rightElement?: ReactNode` | React        | -             |

## UI Components

| Component  | Purpose                      | Props | Dependencies    | Last Modified |
| ---------- | ---------------------------- | ----- | --------------- | ------------- |
| `Sidebar`  | UI component for sidebar     | -     | React Context   | -             |
| `Button`   | Custom button component      | -     | -               | -             |
| `Card`     | Container for content        | -     | -               | -             |
| `Form`     | Enhanced form component      | -     | React Hook Form | -             |
| `Sheet`    | Slide-in panel component     | -     | -               | -             |
| `Carousel` | Image/content carousel       | -     | React Context   | -             |
| `Chart`    | Data visualization component | -     | React Context   | -             |

## Note

This inventory is a starting point and will be expanded as more components are analyzed. The list includes components identified through the initial scan of the codebase.
