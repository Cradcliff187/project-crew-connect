
import { EntityType, FieldDefinition } from '@/types/reports';

// Define entity display names
export const entityNames: Record<EntityType, string> = {
  'projects': 'Projects',
  'customers': 'Customers',
  'vendors': 'Vendors',
  'subcontractors': 'Subcontractors',
  'work_orders': 'Work Orders',
  'estimates': 'Estimates',
  'expenses': 'Expenses',
  'time_entries': 'Time Entries',
  'change_orders': 'Change Orders',
  'employees': 'Employees'
};

// Map entity types to their actual database table names
export const entityTableMap: Record<EntityType, string> = {
  'projects': 'projects',
  'customers': 'customers',
  'vendors': 'vendors',
  'subcontractors': 'subcontractors',
  'work_orders': 'maintenance_work_orders',
  'estimates': 'estimates',
  'expenses': 'expenses',
  'time_entries': 'time_entries',
  'change_orders': 'change_orders',
  'employees': 'employees'
};

// Define fields for each entity type
export const entityFields: Record<EntityType, FieldDefinition[]> = {
  'projects': [
    { label: 'Project ID', field: 'projectid', type: 'text' },
    { label: 'Project Name', field: 'projectname', type: 'text' },
    { label: 'Customer', field: 'customername', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Created Date', field: 'createdon', type: 'date' },
    { label: 'Total Budget', field: 'total_budget', type: 'currency' },
    { label: 'Current Expenses', field: 'current_expenses', type: 'currency' },
    { label: 'Budget Utilization', field: 'budget_utilization', type: 'percentage' }
  ],
  'customers': [
    { label: 'Customer ID', field: 'customerid', type: 'text' },
    { label: 'Customer Name', field: 'customername', type: 'text' },
    { label: 'Email', field: 'contactemail', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Created Date', field: 'createdon', type: 'date' }
  ],
  'vendors': [
    { label: 'Vendor ID', field: 'vendorid', type: 'text' },
    { label: 'Vendor Name', field: 'vendorname', type: 'text' },
    { label: 'Email', field: 'email', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Created Date', field: 'createdon', type: 'date' }
  ],
  'subcontractors': [
    { label: 'Subcontractor ID', field: 'subid', type: 'text' },
    { label: 'Name', field: 'subname', type: 'text' },
    { label: 'Email', field: 'contactemail', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Rating', field: 'rating', type: 'number' },
    { label: 'Created Date', field: 'created_at', type: 'date' }
  ],
  'work_orders': [
    { label: 'Work Order ID', field: 'work_order_id', type: 'text' },
    { label: 'Title', field: 'title', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Priority', field: 'priority', type: 'text' },
    { label: 'Created Date', field: 'created_at', type: 'date' },
    { label: 'Due Date', field: 'due_by_date', type: 'date' },
    { label: 'Progress', field: 'progress', type: 'percentage' },
    { label: 'Total Cost', field: 'total_cost', type: 'currency' }
  ],
  'estimates': [
    { label: 'Estimate ID', field: 'estimateid', type: 'text' },
    { label: 'Project Name', field: 'projectname', type: 'text' },
    { label: 'Customer Name', field: 'customername', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Created Date', field: 'datecreated', type: 'date' },
    { label: 'Amount', field: 'estimateamount', type: 'currency' },
    { label: 'Contingency', field: 'contingencyamount', type: 'currency' },
    { label: 'Total with Contingency', field: 'total_with_contingency', type: 'currency' }
  ],
  'expenses': [
    { label: 'Description', field: 'description', type: 'text' },
    { label: 'Type', field: 'expense_type', type: 'text' },
    { label: 'Amount', field: 'amount', type: 'currency' },
    { label: 'Date', field: 'expense_date', type: 'date' },
    { label: 'Vendor', field: 'vendor_id', type: 'text' }
  ],
  'time_entries': [
    { label: 'Employee', field: 'employee_id', type: 'text' },
    { label: 'Date Worked', field: 'date_worked', type: 'date' },
    { label: 'Hours', field: 'hours_worked', type: 'number' },
    { label: 'Rate', field: 'employee_rate', type: 'currency' },
    { label: 'Total Cost', field: 'total_cost', type: 'currency' },
    { label: 'Notes', field: 'notes', type: 'text' }
  ],
  'change_orders': [
    { label: 'CO Number', field: 'change_order_number', type: 'text' },
    { label: 'Title', field: 'title', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Amount', field: 'total_amount', type: 'currency' },
    { label: 'Impact Days', field: 'impact_days', type: 'number' },
    { label: 'Requested Date', field: 'requested_date', type: 'date' },
    { label: 'Approved Date', field: 'approved_date', type: 'date' },
    { label: 'Requested By', field: 'requested_by', type: 'text' }
  ],
  'employees': [
    { label: 'Name', field: 'full_name', type: 'text' },
    { label: 'Email', field: 'email', type: 'text' },
    { label: 'Role', field: 'role', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Hourly Rate', field: 'hourly_rate', type: 'currency' },
    { label: 'Created Date', field: 'created_at', type: 'date' }
  ]
};
