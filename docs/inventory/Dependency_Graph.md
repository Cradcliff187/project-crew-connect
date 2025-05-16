# Dependency Graph

This document contains information about the application's dependency graph. Due to the complexity of generating the full graph programmatically, this document provides instructions for generating the dependency graph and a high-level overview of the major dependencies.

## Generating the Dependency Graph

To generate the complete dependency graph, follow these steps:

1. Install the Madge tool:

```bash
npm install -g madge
```

2. Generate a visual dependency graph (requires Graphviz installed):

```bash
madge --image dependency-graph.png --extensions js,jsx,ts,tsx src/
```

3. Generate a JSON representation of dependencies:

```bash
madge --json --extensions js,jsx,ts,tsx src/ > dependency.json
```

## Major Module Dependencies

Based on code analysis, here are the major dependency relationships in the application:

### Core Dependencies

```
App
├── AuthProvider
├── Routes (React Router)
└── Layout
    ├── AppSidebar
    ├── Header
    └── Pages
        ├── Dashboard
        ├── Projects
        │   └── ProjectDetail
        ├── WorkOrders
        │   └── WorkOrderDetail
        ├── Estimates
        │   └── EstimateDetail
        ├── Documents
        ├── Vendors
        │   └── VendorDetail
        ├── Subcontractors
        │   └── SubcontractorDetail
        ├── Contacts
        │   └── ContactDetail
        ├── TimeTracking
        ├── ActiveWork
        └── Reports
```

### Component Dependency Tree

```
ui/ (base components)
↑
common/ (shared components)
↑
Feature-specific components
(projects/, estimates/, workOrders/, etc.)
↑
Page components
```

### Service Layer Dependencies

```
Pages/Components
↓
Hooks (src/hooks/)
↓
Services (src/services/)
↓
Integrations (src/integrations/supabase)
```

## Key Insights

1. **UI Component Hierarchy**: The application uses a layered approach with core UI components at the bottom, common components in the middle, and feature-specific components at the top.

2. **Service-Based Architecture**: Business logic is encapsulated in hooks and services, separating it from UI components.

3. **Data Flow**: Follows a typical React pattern with props flowing down and events flowing up through components.

4. **Integration Points**: Supabase client is used directly in multiple components, which creates tight coupling to the database implementation.

5. **Authentication**: The Auth context is a central dependency for most parts of the application.

## Placeholder for Dependency Graph Image

![Dependency Graph](Dependency_Graph.png)

_Note: Replace this with the actual generated graph image once it has been created using the above commands._
