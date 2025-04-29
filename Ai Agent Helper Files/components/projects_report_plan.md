# Projects Report Implementation Plan

## Overview

The Projects Report will provide comprehensive insights into project data, financial metrics, and progress statistics. This component will integrate with the existing application architecture and leverage the UI component library (shadcn) and data visualization tools (Recharts).

## Component Structure

### Main Component: `ProjectsReport.tsx`

- Location: `src/components/reports/ProjectsReport.tsx`
- Primary container for the entire report interface

### Dependencies

- React Query for data fetching
- Shadcn UI components for interface elements
- Recharts for data visualization
- Common report components (ReportContentSection, etc.)

## Data Structure

### Project Data Interface

```typescript
interface ProjectData {
  projectid: string;
  projectname: string;
  customername: string;
  status: string;
  created_at: string;
  start_date: string;
  target_end_date: string;
  total_budget: number;
  current_expenses: number;
  budget_utilization: number;
  contract_value: number;
  actual_revenue: number;
  original_base_cost: number;
  original_selling_price: number;
  original_contingency_amount: number;
  change_order_cost_impact: number;
  change_order_selling_price_impact: number;
  gross_margin: number;
  gross_margin_percentage: number;
  completion_percentage: number;
}
```

### Filter State Interface

```typescript
interface ProjectFilters {
  search: string;
  dateRange: DateRange;
  status: string;
  client: string;
  manager: string;
  budgetRange: { min: number; max: number } | null;
  completionRange: { min: number; max: number } | null;
}
```

## UI Sections

### 1. Filter Section

- Status filter (Active/Completed/On Hold/All)
- Client filter (dropdown of available clients)
- Manager filter (dropdown of project managers)
- Date range picker (for project start/end dates)
- Budget range slider or input fields
- Completion percentage range slider or input fields
- Search input for global search

### 2. Summary Metrics Section

- Total Projects count
- Active Projects count
- Average Completion Percentage
- Total Budget across projects
- Total Revenue across projects
- Average Budget Utilization

### 3. Main Content Section (Tabbed)

- Table View: Detailed project data with sortable columns
- Charts View: Visualizations of project distribution and financial metrics
- Export View: Options to export data in various formats

## Data Queries

### Main Query Function

- Use `fetchReportData('projects', filters)` from reportUtils.ts
- Will apply filters to query:
  - Text search across projectid, projectname
  - Status filtering
  - Client filtering
  - Manager filtering
  - Date range filtering
  - Budget range filtering
  - Completion percentage filtering

### Calculated Fields

The component should calculate these fields if not available directly:

- Budget Utilization: (Current Expenses / Total Budget) × 100%
- Gross Margin: Contract Value - Original Base Cost
- Gross Margin Percentage: (Gross Margin / Contract Value) × 100%
- Completion Percentage: Based on timeline or budget utilization

## Visualizations

### 1. Status Distribution Chart

- Pie chart showing count of projects by status
- Displays: Active, Completed, On Hold, etc.

### 2. Budget vs. Actual Expenses Chart

- Bar chart comparing total budget vs current expenses for top projects
- Alternative view showing budget utilization percentages

### 3. Timeline View

- Gantt chart showing project timelines (start to target end)
- Color-coded by status or completion percentage

### 4. Financial Metrics Chart

- Bar or line chart showing contract value, revenue, and margins
- Can be filtered by time period or project type

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
- Use virtualization for large tables

## Special Features

### Timeline Visualization

- Consider integrating a specialized timeline or Gantt chart library
- Allow zooming and panning for detailed timeline exploration

### Budget Analysis

- Implement drill-down capability to see expense breakdown
- Add forecasting visualization based on current burn rate
