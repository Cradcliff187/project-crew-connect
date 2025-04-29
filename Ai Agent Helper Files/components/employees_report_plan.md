# Employees Report Implementation Plan

## Overview

The Employees Report will provide comprehensive insights into employee data, performance metrics, and utilization statistics. This component will integrate with the existing application architecture and leverage the UI component library (shadcn) and data visualization tools (Recharts).

## Component Structure

### Main Component: `EmployeesReport.tsx`

- Location: `src/components/reports/EmployeesReport.tsx`
- Primary container for the entire report interface

### Dependencies

- React Query for data fetching
- Shadcn UI components for interface elements
- Recharts for data visualization
- Common report components (ReportContentSection, etc.)

## Data Structure

### Employee Data Interface

```typescript
interface EmployeeData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  status: string;
  hourly_rate: number;
  cost_rate?: number;
  bill_rate?: number;
  created_at: string;
  billable_hours?: number;
  utilization?: number;
  revenue_generated?: number;
}
```

### Filter State Interface

```typescript
interface EmployeeFilters {
  search: string;
  dateRange: DateRange;
  status: string;
  role: string;
  department: string;
}
```

## UI Sections

### 1. Filter Section

- Status filter (Active/Inactive/All)
- Role filter (Admin/Manager/Technician/etc.)
- Department filter (if applicable)
- Date range picker for hire date filtering
- Search input for global search

### 2. Summary Metrics Section

- Total Employees count
- Active Employees count
- Total Billable Hours
- Total Revenue Generated
- Average Utilization percentage

### 3. Main Content Section (Tabbed)

- Table View: Detailed employee data with sortable columns
- Charts View: Visualizations of employee distribution and performance
- Export View: Options to export data in various formats

## Data Queries

### Main Query Function

- Use `fetchReportData('employees', filters)` from reportUtils.ts
- Will apply filters to query:
  - Text search across first_name, last_name, email
  - Status filtering
  - Role filtering
  - Date range filtering for created_at/hire_date

### Calculated Fields

The component should calculate these fields if not available directly:

- Billable Hours: Sum of time entries for each employee
- Utilization: Percentage of billable hours vs total available hours
- Revenue Generated: Billable hours × hourly rate

## Visualizations

### 1. Role Distribution Chart

- Pie chart showing count of employees by role
- Displays: Admin, Manager, Technician, Laborer, Office Staff, etc.

### 2. Status Distribution Chart

- Pie chart showing Active vs Inactive employees

### 3. Department Distribution Chart

- Pie chart showing employee count per department

### 4. Top Performers Chart

- Bar chart showing top 5 employees by utilization percentage
- Alternative view for top 5 by revenue generated

## Implementation Steps

1. Create basic component structure with filter state
2. Implement data fetching with React Query
3. Build filter UI with appropriate controls
4. Implement summary metrics calculation
5. Create the tabbed interface for main content
6. Implement table view with sorting
7. Add data visualizations
8. Implement export functionality
9. Add responsive design adjustments
10. Test with sample data and optimize performance

## Performance Considerations

- Use memoization for calculated fields and chart data
- Implement pagination for large datasets
- Add loading states and error handling
- Consider caching strategies for report data
