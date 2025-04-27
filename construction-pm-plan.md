# Construction Project Management Plan

## Version History

| Version | Date       | Description                                                          | Author       |
| ------- | ---------- | -------------------------------------------------------------------- | ------------ |
| v0.1    | 2023-12-01 | Initial plan creation                                                | AI Assistant |
| v0.2    | 2023-12-15 | Enhanced focus on low cognitive load UI/UX and financial tracking    | AI Assistant |
| v0.3    | 2023-12-16 | Simplified change order flow and improved financial clarity          | AI Assistant |
| v0.4    | 2023-12-17 | Removed change order statuses, focused on CRUD and financial clarity | AI Assistant |
| v0.5    | 2023-12-18 | Ensured project-wide UI/UX coherence and integration                 | AI Assistant |
| v0.6    | 2023-12-19 | Added labor cost tracking improvements and rate management           | AI Assistant |

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

### Change Order Schema

```
{
  "id": "uuid",
  "projectId": "uuid",
  "title": "string",
  "description": "string",
  "requestedBy": "uuid",
  "requestDate": "date",
  "lastModifiedDate": "date",
  "lastModifiedBy": "uuid",
  "financialImpact": {
    "budgetEstimate": {
      "materialsCost": "number",
      "laborCost": "number",
      "otherCosts": "number",
      "totalCost": "number"
    },
    "actualCost": {
      "materialsCost": "number",
      "laborCost": "number",
      "otherCosts": "number",
      "totalCost": "number"
    },
    "revenueEstimate": {
      "baseAmount": "number",
      "discount": "number?",
      "netAmount": "number"
    },
    "actualRevenue": {
      "baseAmount": "number",
      "discount": "number?",
      "netAmount": "number"
    },
    "profit": {
      "estimated": "number",
      "actual": "number",
      "margin": "number"
    }
  },
  "scheduleImpact": {
    "daysAdded": "number?",
    "originalEndDate": "date?",
    "revisedEndDate": "date?"
  },
  "items": [
    {
      "id": "uuid",
      "description": "string",
      "category": "enum: materials, labor, other",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number",
      "isExpense": "boolean",
      "notes": "string?"
    }
  ],
  "documents": ["uuid"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
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

## Technical Decisions Log

| Date       | Decision                                        | Rationale                                                                        |
| ---------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| 2023-12-01 | Use React Query for data fetching               | Provides caching, refetching, and mutation capabilities with minimal boilerplate |
| 2023-12-01 | Implement Zod for form validation               | Type-safe validation with TypeScript integration                                 |
| 2023-12-01 | Organize components by domain                   | Improves maintainability and separation of concerns                              |
| 2023-12-01 | Use Tailwind CSS for styling                    | Consistent with existing codebase and provides utility-first approach            |
| 2023-12-01 | Implement Shadcn/UI components                  | Provides accessible, customizable UI components built on Radix primitives        |
| 2023-12-15 | Use React Hook Form for form management         | Reduces re-renders and provides controlled component approach                    |
| 2023-12-15 | Implement Recharts for financial visualizations | Highly customizable and works well with React for responsive visualizations      |
| 2023-12-15 | Use PDF generation for financial reporting      | Provides client-ready reporting capabilities with consistent formatting          |
| 2023-12-16 | Implement consistent financial type indicators  | Improves clarity by distinguishing between expenses, revenue, estimates, actuals |
| 2023-12-17 | Remove change order status management           | Simplifies UI by focusing on CRUD operations instead of workflow states          |
| 2023-12-17 | Use MCP for database validations                | Leverages Supabase capabilities for data integrity without complex client logic  |

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

### Simplified Change Order Process

#### Current Issues

- Too many approval steps and status changes
- Unclear distinction between expenses and revenue items
- Difficult to add and visualize discounts
- Confusing workflow for creating and managing change orders
- Unclear distinction between estimated and actual costs/revenue

#### Improved Approach

1. **No Status Management**:

   - Eliminate all status tracking for change orders
   - Simply focus on CRUD operations (create, read, update, delete)
   - Track modification dates and users instead of approval states

2. **Clear Financial Distinction**:

   - Separate sections for budget estimates vs. actual costs
   - Separate sections for revenue estimates vs. actual revenue
   - Clear profit calculation with estimated vs. actual

3. **Intuitive Discount Management**:

   - Add dedicated discount fields in both cost and revenue sections
   - Show original amount, discount, and final amount in sequential order
   - Provide discount visualization with strikethrough on original amount

4. **Simplified Change Order Management**:

   - Basic CRUD interface with list/detail views
   - Simple entry forms with clear financial sections
   - Real-time calculation of profit and margins
   - Drag-and-drop document attachment
   - Direct editing capability for all fields

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

#### Data Model Enhancements

1. **Settings Table Extensions**:

   ```
   {
     "id": "uuid",
     "key": "string",
     "value": "string",
     "description": "string",
     "category": "string",
     "created_at": "timestamp",
     "updated_at": "timestamp"
   }
   ```

   Required settings:

   - `default_labor_cost_rate`: Default hourly cost for labor (internal cost)
   - `default_labor_bill_rate`: Default hourly billing rate for labor (client price)
   - `require_time_entry_for_labor_expense`: Boolean flag to enforce time entry requirement

2. **Employee Table Enhancements**:

   ```
   {
     // Existing fields...
     "cost_rate": "number",       // Internal cost of employee's time
     "bill_rate": "number",       // Rate charged to clients
     "default_bill_rate": "boolean"  // Whether to use default bill rate instead of custom
   }
   ```

3. **Time Entry Enhancements**:
   ```
   {
     // Existing fields...
     "cost_rate": "number",
     "bill_rate": "number",
     "total_cost": "number",
     "total_billable": "number"
   }
   ```

#### UI/UX Improvements

1. **Settings Interface**:

   - Add Labor Settings section to application settings
   - Provide clear inputs for default cost and bill rates
   - Include toggle for requiring time entries for labor expenses

2. **Employee Rate Management**:

   - Add cost rate and bill rate fields to employee forms
   - Provide option to use default rates or custom rates
   - Show billing multiple (markup) based on cost vs. bill rate difference

3. **Time Entry Experience - Field Worker Focus**:

   - Create streamlined, mobile-optimized interface for field workers
   - Show only essential information needed for time logging (work performed, hours, notes)
   - Hide cost rates, bill rates, and financial details from field worker view
   - Optimize for quick entry with minimum taps/clicks
   - Focus on offline capability for remote job sites
   - Include simple project/work order selection without complex financial details

4. **Time Entry Administration View**:

   - Develop separate, more detailed view for office staff/administrators
   - Display both cost and bill rates in this administrative view
   - Show calculated cost and billable amounts in real-time
   - Provide visual distinction between cost rates and bill rates
   - Design with future role-based access control in mind
   - Add toggle or separate navigation for switching between simplified and detailed views

5. **Expense Interface Improvements**:
   - Disable manual labor expense creation when setting requires time entries
   - Show clear connection between time entries and generated labor expenses
   - Provide warning when attempting to delete a time entry with a linked expense

#### Integration Points

1. **Time Entry to Expense Flow**:

   - Time entry creation automatically generates corresponding labor expense
   - Time entry updates propagate to linked expense records
   - Time entry deletion should handle linked expense records appropriately

2. **Validation Rules**:

   - Validate that labor expenses have associated time entries when setting requires it
   - Ensure cost rates and bill rates are always positive values
   - Prevent deletion of time entries with linked expenses without confirmation

3. **Financial Reporting**:
   - Show labor costs based on actual employee rates vs. estimated rates
   - Calculate labor cost variances between estimates and actuals
   - Track labor utilization and efficiency metrics

### Implementation Plan

1. **Database Updates**:

   - Create migration to add settings for default labor rates
   - Add cost_rate and bill_rate fields to employees table
   - Ensure time_entry_id is properly indexed in the expenses table

2. **Backend Logic**:

   - Implement validation for labor expenses requiring time entries
   - Create functions to calculate proper rates based on employee data or defaults
   - Develop logic to handle rate changes and updates

3. **UI Components**:
   - Develop settings interface for labor rate configuration
   - Enhance employee forms with rate management
   - Update time entry forms to display and calculate both cost and bill amounts
   - Modify expense interfaces to respect time entry requirements

This labor cost tracking improvement will ensure accurate financial tracking of both estimated and actual labor costs, with proper distinction between internal costs and billable amounts.

---

This plan will be updated regularly as development progresses, decisions are made, and requirements evolve.
