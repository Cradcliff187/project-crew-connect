# Construction Project Management Plan

## Version History

| Version | Date       | Description                                                                                          | Author       |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------- | ------------ |
| v0.1    | 2023-12-01 | Initial plan creation                                                                                | AI Assistant |
| v0.2    | 2023-12-15 | Enhanced focus on low cognitive load UI/UX and financial tracking                                    | AI Assistant |
| v0.3    | 2023-12-16 | Simplified change order flow and improved financial clarity                                          | AI Assistant |
| v0.4    | 2023-12-17 | Removed change order statuses, focused on CRUD and financial clarity                                 | AI Assistant |
| v0.5    | 2023-12-18 | Ensured project-wide UI/UX coherence and integration                                                 | AI Assistant |
| v0.6    | 2023-12-19 | Added labor cost tracking improvements and rate management (Plan Update)                             | AI Assistant |
| v0.7    | 2024-05-27 | Updated plan: Labor cost DB schema complete, focus shifts to logic/UI.                               | Gemini       |
| v0.8    | 2024-05-27 | Decision: Do not link time entries to specific budget items; update backend logic.                   | Gemini       |
| v0.9    | 2024-05-27 | Decision: Create dedicated Employee Management module separate from Contacts.                        | Gemini       |
| v0.10   | 2024-05-28 | Decision: Removed Mobile Detailed Log; focus mobile on Quick Log & Add Receipt.                      | Gemini       |
| v0.11   | 2024-05-28 | Decision: Reinstate Change Order status tracking (revising v0.4); focus on core CO CRUD & Items.     | Gemini       |
| v0.12   | 2024-05-28 | Decision Reverted: Remove CO status tracking (back to v0.4 focus); focus on CRUD, Items, Financials. | Gemini       |

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Component Breakdown](#component-breakdown)
4. [Data Model](#data-model)
5. [API Design](#api-design)
6. [UI/UX Approach](#uiux-approach)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Technical Decisions Log](#technical-decisions-log)
9. [Open Questions & Risks](#open-questions--risks)
10. [Dependencies](#dependencies)

## Executive Summary

This document outlines the plan for developing and maintaining the Construction Project Management component within the AKC Revisions-V1 application. The system aims to provide comprehensive tools for managing construction projects, including budget tracking, expense management, work orders, change orders, and document management.

The construction PM component will integrate with existing modules while introducing new specialized functionality to address the unique needs of construction project management. This plan serves as a living document that will evolve as development progresses.

**Core Focus Areas:**

1. **Low Cognitive Load UI/UX**: Create interfaces that simplify complex financial management tasks with intuitive interactions and visual clarity.
2. **Comprehensive Financial Tracking**: Implement detailed budget management, expense tracking, estimation tools, change order processing, and contingency fund management.

## Architecture Overview

The Construction Project Management component follows a React-based frontend architecture using TypeScript. It leverages the following key technologies:

- **Frontend Framework**: React with TypeScript
- **UI Components**: Shadcn/UI (built on Radix UI primitives)
- **State Management**: React Query for server state, React Context for local state
- **Form Handling**: React Hook Form with Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **API**: Supabase Functions and REST endpoints

The architecture follows a component-based structure with modular organization. Components are grouped by domain (projects, work orders, change orders, etc.) with shared UI components for consistency.

## Component Breakdown

### Core Construction PM Components

#### Project Management

- **Project Overview Dashboard**: Central hub for project insights
- **Project Details**: Comprehensive project information display
- **Project Creation Wizard**: Step-by-step project setup
- **Project Edit Form**: Modification of project details

#### Financial Management

- **Budget Overview**: High-level budget visualization with variance analysis
- **Budget Items Management**: Detailed budget line items with real-time tracking
- **Expense Tracking**: Recording and categorizing expenses with receipt management
- **Financial Impact Analysis**: Budget vs. actual tracking with variance visualization
- **Estimation Tools**: Comprehensive estimating with comparison capabilities
- **Change Order Financial Processing**: Financial impact assessment and approval routing
- **Contingency Management**: Allocation, tracking, and justification of contingency funds

#### Work Orders

- **Work Order List**: Overview of all work orders
- **Work Order Details**: Comprehensive work order information
- **Work Order Creation**: Interface for creating new work orders
- **Materials Management**: Tracking materials for work orders
- **Expenses Management**: Managing expenses for work orders
- **Time Logging**: Recording labor hours for work orders

#### Change Orders

- **Change Order List**: Overview of all change orders
- **Change Order Details**: Comprehensive change information
- **Change Order Creation**: Interface for creating change orders
- **Financial Impact Analysis**: Budget impact visualization
- **Schedule Impact Visualization**: Timeline impact display
- **Approval Workflow**: Process for reviewing and approving changes

#### Document Management

- **Document Upload**: Interface for adding project documents
- **Document Organization**: Categorization and tagging system
- **Document Viewing**: Integrated document preview

### Supporting Components

- **Customer/Contact Management**: Managing project stakeholders
- **Vendor Management**: Tracking suppliers and subcontractors
- **Reporting**: Custom report generation
- **Timeline/Schedule Visualization**: Project timeline display

#### Employee Management (New Section - v0.9)

_Decision: Employees will be managed separately from general contacts._

- **Employee List**: View, filter, and search active/inactive employees.
- **Employee Detail View**: Display comprehensive employee information, including rates.
- **Employee Create/Edit Form**: Interface for adding/modifying employee details, including cost/bill rates.

## Data Model

### Project Schema

```
{
  "id": "uuid",
  "projectName": "string",
  "customerId": "uuid",
  "jobDescription": "string",
  "status": "enum: new, active, completed, pending, cancelled, on_hold",
  "estimateId": "uuid?",
  "siteLocation": {
    "address": "string?",
    "city": "string?",
    "state": "string?",
    "zip": "string?"
  },
  "dueDate": "date?",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Work Order Schema

```
{
  "id": "uuid",
  "projectId": "uuid",
  "title": "string",
  "description": "string",
  "status": "enum: draft, scheduled, in_progress, completed, on_hold, cancelled",
  "assignedTo": "uuid[]",
  "startDate": "date?",
  "endDate": "date?",
  "materials": [
    {
      "id": "uuid",
      "name": "string",
      "quantity": "number",
      "unitCost": "number",
      "totalCost": "number"
    }
  ],
  "expenses": [
    {
      "id": "uuid",
      "description": "string",
      "amount": "number",
      "date": "date",
      "receiptUrl": "string?"
    }
  ],
  "timeLogs": [
    {
      "id": "uuid",
      "workerId": "uuid",
      "date": "date",
      "hours": "number",
      "description": "string?"
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Change Order Schema (Revised v0.12)

_Note: Removing status tracking per v0.4/v0.12. DB currently has status field/history table - recommend removal via migration._

```
{
  "id": "uuid",
  "entity_type": "string", // e.g., 'PROJECT', 'WORK_ORDER'
  "entity_id": "string",
  "change_order_number": "string?",
  "title": "string",
  "description": "string?",
  "requested_by": "string?",
  "requested_date": "date?",
  "cost_impact": "number?", // Calculated sum from items?
  "revenue_impact": "number?", // Calculated sum from items?
  "total_amount": "number?", // Calculated sum from items?
  "impact_days": "number?",
  "document_id": "uuid?",
  // Items are in separate change_order_items table
  // Status history table should be removed
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Budget Schema

```
{
  "id": "uuid",
  "projectId": "uuid",
  "totalBudget": "number",
  "items": [
    {
      "id": "uuid",
      "category": "string",
      "description": "string",
      "budgetedAmount": "number",
      "actualAmount": "number?",
      "variance": "number?",
      "variancePercentage": "number?"
    }
  ],
  "contingency": {
    "percentage": "number",
    "amount": "number",
    "used": "number",
    "remaining": "number",
    "allocations": [{
      "id": "uuid",
      "amount": "number",
      "description": "string",
      "date": "date",
      "approvedBy": "uuid?"
    }]
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Expense Schema

```
{
  "id": "uuid",
  "projectId": "uuid",
  "workOrderId": "uuid?",
  "category": "string",
  "description": "string",
  "amount": "number",
  "date": "date",
  "vendor": "string?",
  "receiptUrl": "string?",
  "status": "enum: pending, approved, rejected",
  "approvedBy": "uuid?",
  "approvalDate": "date?",
  "notes": "string?",
  "tags": ["string"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Settings Schema (Added v0.7)

_Note: A `settings` table was found to exist in the database, aligning with the planned need._

```
{
  "id": "uuid",
  "key": "string", // Unique key (e.g., 'default_labor_cost_rate')
  "value": "string", // Setting value
  "description": "string?",
  "category": "string?", // e.g., 'Labor', 'System'
  "created_at": "timestamp?",
  "updated_at": "timestamp?"
}
```

### Labor Cost Related Schemas (Updated v0.7)

_Note: The following schemas reflect the current state found in the database, which includes the cost/bill rate separation planned in v0.6._

**Employees Table:**

```
{
  // Existing fields...
  "employee_id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "email": "string?",
  "phone": "string?",
  "role": "string?",
  "hourly_rate": "number?", // Original rate field, usage TBD (may be deprecated)
  "status": "string?",
  "cost_rate": "number?",   // Internal cost of employee's time (Added)
  "bill_rate": "number?",   // Rate charged to clients (Added)
  "default_bill_rate": "boolean?", // Whether to use default bill rate instead of custom (Added, default true)
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Time Entries Table:**

```
{
  // Existing fields...
  "id": "uuid",
  "entity_type": "string", // e.g., 'work_order', 'project'
  "entity_id": "string",
  "date_worked": "date",
  "start_time": "time",
  "end_time": "time",
  "hours_worked": "number",
  "employee_id": "uuid?",
  "employee_rate": "number?", // Original rate field, usage TBD (may be deprecated)
  "notes": "string?",
  "has_receipts": "boolean?",
  "location_data": "jsonb?",
  "cost_rate": "number?",       // Rate used for cost calculation at time of entry (Added)
  "bill_rate": "number?",       // Rate used for billable amount at time of entry (Added)
  "total_cost": "number?",      // Calculated cost (hours * cost_rate) (Added)
  "total_billable": "number?",  // Calculated billable amount (hours * bill_rate) (Added)
  // "project_budget_item_id": "uuid?", // Field exists but WILL NOT be populated via Time Entry form per v0.8 decision
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## API Design

### Project Endpoints

- `GET /api/projects`: List all projects
- `GET /api/projects/:id`: Get project details
- `POST /api/projects`: Create new project
- `PATCH /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project

### Work Order Endpoints

- `GET /api/work-orders`: List all work orders
- `GET /api/work-orders/:id`: Get work order details
- `POST /api/work-orders`: Create new work order
- `PATCH /api/work-orders/:id`: Update work order
- `DELETE /api/work-orders/:id`: Delete work order

### Change Order Endpoints

- `GET /api/change-orders`: List all change orders
- `GET /api/change-orders/:id`: Get change order details
- `POST /api/change-orders`: Create new change order
- `PATCH /api/change-orders/:id`: Update change order
- `DELETE /api/change-orders/:id`: Delete change order

### Budget Endpoints

- `GET /api/budgets/:projectId`: Get project budget
- `POST /api/budgets`: Create project budget
- `PATCH /api/budgets/:id`: Update project budget
- `POST /api/budgets/:id/items`: Add budget item
- `PATCH /api/budgets/:id/items/:itemId`: Update budget item
- `DELETE /api/budgets/:id/items/:itemId`: Delete budget item

## UI/UX Approach

### Design Principles

- **Consistency**: Maintain design consistency with existing application components
- **Clarity**: Present complex construction data in easily digestible formats
- **Efficiency**: Minimize clicks and steps for common workflows
- **Responsiveness**: Ensure usability across device sizes
- **Progressive Disclosure**: Surface essential information first, with details available on demand
- **Low Cognitive Load**: Design interfaces that reduce mental effort required to understand and interact with complex financial data
- **Visual Hierarchy**: Use color, typography, and layout to guide users through complex financial workflows
- **Guided Interactions**: Provide step-by-step guidance for multi-step processes
- **Contextual Help**: Incorporate tooltips and inline guidance to assist users with unfamiliar concepts
- **Error Prevention**: Design interfaces that prevent errors in financial data entry and manipulation

### UI Components

- Leverage existing Shadcn/UI components for consistent look and feel
- Utilize dashboards with cards for key metrics
- Implement tables with filtering, sorting, and pagination for data-heavy views
- Use form wizards for complex multi-step processes
- Implement visualizations for financial and schedule data

### Financial Interface Guidelines

- **Budget Dashboards**: Provide at-a-glance views of financial health with visual indicators
- **Expense Entry**: Simplify receipt management with OCR and categorization assistance
- **Change Order Workflows**: Guide users through the approval process with clear status indicators
- **Variance Analysis**: Visually highlight differences between estimated and actual costs
- **Contingency Management**: Provide clear visualization of contingency fund allocation and usage
- **Financial Reporting**: Generate easy-to-understand reports for different stakeholder needs

### Key User Flows

1. **Project Creation**: Streamlined wizard for setting up new construction projects
2. **Budget Management**: Intuitive interface for creating and modifying budgets
3. **Work Order Management**: Efficient process for creating and tracking work orders
4. **Change Order Workflow**: Clear approval process with impact visualization
5. **Financial Tracking**: Easy-to-understand budget vs. actual comparisons

## Implementation Roadmap

### Phase 1: Foundation (Month 1)

- Core project management functionality
- Basic budget tracking
- Project dashboard with key metrics
- Essential database schema and API endpoints

### Phase 2: Financial Core (Month 2)

- Budget management framework
- Basic expense tracking
- Simple estimation tools
- Foundation for change order processing
- Initial contingency management

### Phase 3: Work Management (Month 3)

- Work order creation and management
- Materials tracking
- Time logging
- Expense recording

### Phase 4: Financial Advanced Features (Month 4)

- Advanced budget variance analysis
- Receipt OCR and automated categorization
- Detailed estimation comparison tools
- Comprehensive change order approval workflows
- Advanced contingency fund tracking
- Financial reporting and visualization

### Phase 5: Change Management (Month 5)

- Change order creation and workflow
- Financial impact analysis
- Schedule impact visualization
- Approval process implementation

### Phase 6: Optimization (Month 6)

- Performance improvements
- User experience refinements
- Advanced analytics
- Mobile optimization

### Phase 7: Employee Management (Month 7)

- Employee management functionality
- Employee list and detail view
- Employee creation and modification
- Cost/bill rate management

## Technical Decisions Log

| Date       | Decision                                        | Rationale                                                                          |
| ---------- | ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2023-12-01 | Use React Query for data fetching               | Provides caching, refetching, and mutation capabilities with minimal boilerplate   |
| 2023-12-01 | Implement Zod for form validation               | Type-safe validation with TypeScript integration                                   |
| 2023-12-01 | Organize components by domain                   | Improves maintainability and separation of concerns                                |
| 2023-12-01 | Use Tailwind CSS for styling                    | Consistent with existing codebase and provides utility-first approach              |
| 2023-12-01 | Implement Shadcn/UI components                  | Provides accessible, customizable UI components built on Radix primitives          |
| 2023-12-15 | Use React Hook Form for form management         | Reduces re-renders and provides controlled component approach                      |
| 2023-12-15 | Implement Recharts for financial visualizations | Highly customizable and works well with React for responsive visualizations        |
| 2023-12-15 | Use PDF generation for financial reporting      | Provides client-ready reporting capabilities with consistent formatting            |
| 2023-12-16 | Implement consistent financial type indicators  | Improves clarity by distinguishing between expenses, revenue, estimates, actuals   |
| 2023-12-17 | Remove change order status management           | Simplifies UI by focusing on CRUD operations instead of workflow states            |
| 2023-12-17 | Use MCP for database validations                | Leverages Supabase capabilities for data integrity without complex client logic    |
| 2024-05-27 | Labor Cost DB Schema Implemented                | Database tables (`employees`, `time_entries`, `settings`) updated per v0.6 plan.   |
| 2024-05-27 | Separate Employee Management                    | Decided to manage Employees via a dedicated module, distinct from Contacts.        |
| 2024-05-28 | Reinstate Change Order Status Tracking          | Simple CRUD (v0.4 decision) deemed insufficient; status is crucial for workflow.   |
| 2024-05-28 | Revert: Remove Change Order Status Tracking     | Final decision to align with v0.4 simplicity goal; focus on CRUD/Items/Financials. |

## Open Questions & Risks

### Open Questions

1. What level of granularity is needed for budget tracking?
2. How should change orders affect the original project budget?
3. What approval workflows are needed for change orders?
4. How should document versioning be handled?
5. What reporting capabilities are most critical for construction management?
6. What level of automation should be implemented in receipt processing for expenses?
7. How should contingency funds be allocated and tracked across project components?
8. What visualization methods are most effective for financial variance analysis?
9. What is the minimum viable approval workflow for change orders?
10. How can we best visually distinguish between different financial types?
11. How should discounts be applied and displayed in the interface?
12. What are the most important financial metrics to track and display for change orders?
13. **Decision Needed:** Align `change_order_status_history` table with plan - should status tracking (removed in v0.4 plan) be kept or removed from the database? **(Decision v0.12: Remove status tracking. Recommend DB migration)**
14. **Settings Keys:** Define the exact keys and default values needed in the `settings` table (e.g., `default_labor_cost_rate`, `default_labor_bill_rate`, `require_time_entry_for_labor_expense`).
15. **CO Financial Fields:** How should `change_orders.cost_impact`, `revenue_impact`, `total_amount` be populated? Directly editable summaries, or calculated automatically from `change_order_items` via triggers/functions?
16. **Settings Interface:** **(Complete)** UI implemented in `/settings` page.
17. **Employee Rate Management:** **(Next Focus - Target: New Employee Module)** Update employee forms to include `cost_rate` and `bill_rate` fields **within the dedicated Employee Management UI**.
18. **Time Entry Experience - Field Worker Focus:** Develop/verify streamlined, mobile-optimized interface hiding financial rates. **(v0.10 Update: Removed Detailed Log button, focus on Quick Log and Add Receipt sheets).**
19. **Time Entry Administration View:** Develop/verify detailed view showing calculated totals (`total_cost`, `total_billable`).
20. **Expense Interface Improvements:** Adapt UI based on `require_time_entry_for_labor_expense` setting. Clearly show links between time entries and generated labor expenses.

### Risks

1. **Data Model Complexity**: Construction projects have complex relationships that may be challenging to model effectively
2. **Performance**: Large projects with many work orders and documents may cause performance issues
3. **Usability**: Complex construction workflows must remain intuitive for users
4. **Integration**: Must seamlessly integrate with existing components and systems
5. **Scalability**: Solution must scale to handle large construction projects

## Dependencies

### Internal Dependencies

- Authentication system for user permissions
- Document management system for file storage
- Customer/contact management for stakeholder information
- Notification system for alerts and updates

### External Dependencies

- Supabase for database and authentication
- React and related libraries
- UI component libraries
- PDF generation tools for reporting

### Third-party Services

- File storage for documents
- Email service for notifications
- PDF generation service (if applicable)

## Financial Tracking Capabilities

### Budget Management

#### Core Functionality

- Creation and management of project budgets with line item tracking
- Allocation of costs across categories and subcategories
- Real-time tracking of actual vs. budgeted costs
- Variance analysis with threshold-based alerts
- Budget adjustment workflows

#### User Experience

- Visual dashboards with color-coded variance indicators
- Drill-down capability from high-level summaries to detailed line items
- Simplified budget entry with templates and common categories
- Interactive charts showing budget distribution and consumption

### Expense Tracking

#### Core Functionality

- Expense entry with receipt upload and attachment
- Categorization with automatic suggestions
- Approval workflows with notification system
- Expense reports generation
- Receipt OCR and data extraction

#### User Experience

- Mobile-friendly expense entry with camera integration
- Drag-and-drop receipt interface with preview
- Expense categorization assistance with AI suggestions
- Batch expense processing
- Visual expense approval status tracking

### Estimation Tools

#### Core Functionality

- Detailed cost estimating with material and labor components
- Comparison between multiple estimation versions
- Conversion of estimates to budgets
- Historical data integration for accurate estimating
- Markup and profit calculation

#### User Experience

- Side-by-side estimate comparison views
- Visual highlighting of estimate differences
- Guided estimation workflow with material/labor separation
- Template-based estimate creation
- Version history visualization

### Change Order Processing

#### Core Functionality

- Simple CRUD operations for change orders
- Clear separation of budget estimates and actual costs
- Clear separation of revenue estimates and actual revenue
- Profit and margin calculations
- Simple discount application
- Documentation and justification attachment

#### User Experience

- Tabular view of all change orders with filtering and sorting
- Detail view with clear financial sections
- Edit-in-place capability for quick updates
- Real-time financial calculations
- Visual distinction between estimates and actuals
- Side-by-side revenue vs. cost comparison
- Drag-and-drop document attachment

### Contingency Management

#### Core Functionality

- Contingency fund allocation and tracking
- Approval process for contingency use
- Reallocation of unused contingency
- Documentation of contingency justification
- Risk-based contingency calculation

#### User Experience

- Visual representation of available and used contingency
- Simplified request process for contingency allocation
- Clear approval status indicators
- Historical tracking of contingency usage
- Risk-to-contingency visualization

### Financial Reporting

#### Core Functionality

- Customizable financial report generation
- Project financial health scoring
- Cash flow projection and tracking
- Profit margin analysis
- Multi-project financial comparison

#### User Experience

- Interactive report dashboards with filtering capabilities
- Scheduled report generation and distribution
- Export functionality in multiple formats
- Visual financial health indicators
- Printable client-ready report formatting

## UI/UX Improvements

### Simplified Change Order Process (Reverted to v0.4 / v0.12)

_Decision: Status tracking removed. Focus on CRUD, clear financial impacts, and item management._

#### Improved Approach (v0.12)

1.  **No Status Management**: Eliminate all status tracking. Focus on CRUD operations (create, read, update, delete). Track modification dates/users.
2.  **Clear Financial Distinction**: Calculate and display _Estimated_ vs. _Actual_ Cost/Revenue impacts prominently, derived from line items.
3.  **Intuitive Discount Management**: (Remains relevant)
4.  **Simplified Change Order Management**: Provide clear List/Detail views. Implement efficient Line Item management within the CO dialog/form. Real-time calculation of financial impacts based on items.

### Financial Clarity Improvements

1. **Consistent Terminology**:

   - Use consistent terms across all financial interfaces
   - Clear labeling of estimated vs. actual amounts
   - Standardized units and formatting for all currency values

2. **Visual Financial Distinctions**:

   - Use consistent color coding for financial types:
     - Expenses: Red/Orange
     - Revenue: Green
     - Estimates: Blue
     - Actuals: Purple
   - Apply visual patterns (solid vs. striped) for estimated vs. actual values
   - Use icons consistently to represent financial categories

3. **Simplified Financial Summaries**:

   - Provide at-a-glance financial impact summaries
   - Group related financial information together
   - Progressive disclosure for detailed financial breakdowns
   - Clear headings and subheadings for financial sections

4. **Contextual Financial Guidance**:
   - Tooltips explaining financial terms and calculations
   - Inline help text for complex financial concepts
   - Example values for reference
   - Warnings for unusual or potentially erroneous values

## Project-Wide UI/UX Integration

### Project Component Integration

To ensure all aspects of the construction project management component fit together seamlessly, we need to consider how each element integrates within the broader project context:

#### Project Overview & Financial Components

1. **Unified Financial Dashboard**

   - The Financial Summary Tab provides consolidated financial metrics
   - Change orders financial impacts must seamlessly feed into this dashboard
   - Expenses and budget items need consistent representation across all views
   - All financial data must use the same formatting and terminology

2. **Navigational Coherence**

   - Consistent approach to accessing financial data from project detail view
   - Standardized tabs for budget, change orders, expenses, and documents
   - Uniform card-based layout for key financial summaries
   - Consistent button styling and positioning for actions

3. **Data Flow & State Management**
   - Changes in one component (e.g., adding a change order) must update the project financial dashboard
   - Budget modifications need to reflect in all relevant places
   - Change orders must impact estimated vs. actual cost comparisons
   - Real-time calculations across interconnected components

#### Visual Design Consistency

1. **Component Visual Harmony**

   - Use consistent card layouts for all financial components
   - Same color scheme for all financial elements (red for costs, green for revenue)
   - Uniform typography hierarchy across all project components
   - Standard spacing and layout grids
   - Consistent use of icons for financial concepts

2. **Action Patterns**

   - Standardized CRUD operations for all project elements
   - Consistent button placement and styling for add/edit/delete actions
   - Uniform modal/dialog patterns for data entry
   - Similar confirmation patterns for destructive actions

3. **Responsive Behavior**
   - All project components should adapt similarly to different screen sizes
   - Consistent mobile-friendly approach across all financial interfaces
   - Uniform table/list collapse patterns for small screens

### Cross-Component Financial Flow

To maintain clarity in complex financial tracking, all components must maintain consistent approaches to:

1. **Budget Representation**

   - Clear distinction between original budget and current budget
   - Uniform display of budget adjustments from change orders
   - Consistent contingency representation
   - Standard variance calculations and displays

2. **Cost Tracking**

   - Unified approach to displaying estimated vs. actual costs
   - Consistent categorization across budget items, expenses, and change orders
   - Standard profit margin calculations and visualizations
   - Uniform approaches to handling cost overruns

3. **Financial Impact Display**
   - Consistent "impact" visualization for change orders
   - Uniform financial summary cards
   - Standard approach to displaying financial health indicators
   - Coherent drill-down patterns from summary to detail views

## Labor Cost Tracking Improvements

### Current Implementation Analysis

Based on our codebase analysis, we've identified the following aspects of labor cost tracking:

1. **Time Entry to Labor Expense Relationship**:

   - Time entries are recorded for employees with hours worked
   - Labor expenses are automatically created based on time entries
   - Each labor expense links back to its corresponding time entry via `time_entry_id`
   - A default hourly rate of $75 is used when an employee's rate is not available

2. **Rate Application**:

   - Employee rates are stored in the `employees` table under `hourly_rate`
   - For actual costs, the employee's specific hourly rate is used when available
   - For estimates, a standard default labor rate is used (currently hardcoded to $75)

3. **Missing Functionality**:
   - No dedicated settings for default labor rates
   - No distinction between cost rate and bill rate
   - No ability to set different rates for estimated vs. actual labor
   - No validation requiring time entries for labor expenses

### Proposed Improvements

#### Data Model Enhancements (Schema Complete as of v0.7)

_Database schema changes are complete and reflected in the Data Model section above._

1.  **Settings Table**: A `settings` table exists. Need to ensure rows for `default_labor_cost_rate`, `default_labor_bill_rate`, and `require_time_entry_for_labor_expense` are present and utilized.
2.  **Employee Table**: `cost_rate`, `bill_rate`, `default_bill_rate` columns exist.
3.  **Time Entry Table**: `cost_rate`, `bill_rate`, `total_cost`, `total_billable` columns exist.

#### Backend Logic (Updated v0.8)

1.  **Rate Calculation**: (Complete) Logic implemented via `calculate_time_entry_total_cost` function/trigger.
2.  **Total Calculation**: (Complete) Logic implemented via `calculate_time_entry_total_cost` function/trigger.
3.  **Expense Creation**: (Complete) Logic implemented via `create_expense_from_time_entry` function/trigger. Creates a linked `expenses` record with `expense_type = 'LABOR'` and `budget_item_id = NULL`.
4.  **Expense Validation**: (Complete) Logic implemented via `validate_labor_expense` function/trigger to enforce `require_time_entry_for_labor_expense` setting.

#### UI/UX Improvements (Next Implementation Step)

1.  **Settings Interface**: **(Complete)** UI implemented in `/settings` page.
2.  **Employee Rate Management**: **(Next Focus - Target: New Employee Module)** Update employee forms to include `cost_rate` and `bill_rate` fields **within the dedicated Employee Management UI**.
3.  **Time Entry Experience - Field Worker Focus**: Develop/verify streamlined, mobile-optimized interface hiding financial rates. **(v0.10 Update: Removed Detailed Log button, focus on Quick Log and Add Receipt sheets).**
4.  **Time Entry Administration View**: Develop/verify detailed view showing calculated totals (`total_cost`, `total_billable`).
5.  **Expense Interface Improvements**: Adapt UI based on `require_time_entry_for_labor_expense` setting. Clearly show links between time entries and generated labor expenses.

#### Integration Points (Verification Needed)

1.  **Time Entry to Expense Flow**: Verify that time entry creation/update/deletion correctly handles linked expense records and propagates rate/cost information (with NULL `budget_item_id`).
2.  **Validation Rules**: (Complete/Verified) Validation for rates and time entry requirement is implemented.
3.  **Financial Reporting / Budget Aggregation**: Ensure reporting correctly utilizes the distinct cost/bill rates. **Crucially, ensure project/WO budget summaries correctly aggregate labor expenses where `budget_item_id` is NULL.**

### Implementation Plan (Updated v0.12)

1.  **Database Updates**: **(Complete)** Schema exists.
2.  **Backend Logic**: **(Complete)** Functions and triggers for rate calculation, expense creation (without budget link), and validation are implemented.
3.  **UI Components - Labor Cost Focus**: **(Current Focus)**
    - Settings UI: **(Complete)**
    - **Employee Management UI (New)**: **(Next)** Create dedicated list, detail, and form components for managing employees, including the `cost_rate` and `bill_rate` fields.
    - Admin Time Entry View: Update to show calculated totals.
    - Field Worker Time Entry View: **(Partially Complete)** Verify simplification, removed Detailed Log button.
    - Expense Interface: Adapt based on settings.
4.  **Budget Aggregation Logic**: **(Future Task)** Verify/update budget summary calculations to include labor expenses without specific line item links.
5.  **Testing & Refinement**: Thoroughly test the end-to-end flow and refine based on feedback.

- **Current Focus:** Change Management (Phase 5)
  1.  **Update Plan:** Reflect removal of status tracking. **(Complete)**
  2.  **(Optional DB Cleanup):** Recommend migration to drop `status` column and `change_order_status_history` table.
  3.  **Enhance List View:** Update `ProjectChangeOrdersList` (or similar) to _remove_ status display.
  4.  **Enhance Dialog:** Implement core CRUD and **Line Item Management** in `ChangeOrderDialog` / `ChangeOrderItems`, removing status logic.
  5.  **Backend Calculations:** Ensure `change_orders` summary fields are updated based on items.

---

This plan will be updated regularly as development progresses, decisions are made, and requirements evolve.

## Financial-Tracking Audit – 2025-04-27

### Root Causes Identified (Pre-Audit)

1. Direct table selects for `expenses` in several UI hooks bypass roll-up logic → data drift.
2. Missing webhook handler to propagate `TIME` & `CHANGE_ORDER` expense updates to downstream ledgers.
3. Legacy `change_order_status_history` table still present despite v0.12 decision (schema cleanup required).

### Schema / Script Additions

| File / Object                             | Type          | Purpose                                                             |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------- |
| `docs/financial-tracking-map.md`          | Documentation | End-to-end data-flow map (Checkpoint A).                            |
| `db/scripts/financial_tracking_audit.sql` | SQL Script    | Read-only audit queries for orphan detection & reconciliation diff. |

### Updated Workflows (initial)

```
Time Entry ➜ DB Trigger ➜ Expense ➜ Budget Fn ➜ Project.actuals
Change Order ➜ Fn increment_project_co_impact ➜ Budget & Project updates
```

See `docs/financial-tracking-map.md` for full diagram.

### Developer Testing Instructions

1. Run `psql -f db/scripts/financial_tracking_audit.sql` (service-role) and review result sets.
2. Zero rows should be returned **after** fix scripts are executed (Checkpoint B).
3. Validate Project dashboards match query outputs.

---
