
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Filter, Search, FileDown, BarChart3, PieChart, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate, formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Define the types of entities we can report on
type EntityType = 'projects' | 'customers' | 'vendors' | 'subcontractors' | 'work_orders' | 'estimates' | 'expenses' | 'time_entries' | 'change_orders' | 'employees';

// Define field type
type FieldType = 'text' | 'date' | 'number' | 'currency' | 'status' | 'percentage' | 'boolean';

// Define field structure
interface FieldDefinition {
  label: string;
  field: string;
  type: FieldType;
}

// Define fields for each entity type with expanded metrics
const entityFields: Record<EntityType, FieldDefinition[]> = {
  projects: [
    { label: 'Project ID', field: 'projectid', type: 'text' },
    { label: 'Project Name', field: 'projectname', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Customer', field: 'customername', type: 'text' },
    { label: 'Created On', field: 'createdon', type: 'date' },
    { label: 'Total Budget', field: 'total_budget', type: 'currency' },
    { label: 'Current Expenses', field: 'current_expenses', type: 'currency' },
    { label: 'Budget Status', field: 'budget_status', type: 'status' },
    { label: 'Due Date', field: 'due_date', type: 'date' },
    { label: 'Progress', field: 'progress', type: 'percentage' },
    { label: 'Site Location', field: 'sitelocationaddress', type: 'text' },
    { label: 'City', field: 'sitelocationcity', type: 'text' },
    { label: 'State', field: 'sitelocationstate', type: 'text' },
    { label: 'Zip', field: 'sitelocationzip', type: 'text' },
    { label: 'Job Description', field: 'jobdescription', type: 'text' },
    { label: 'Last Modified', field: 'updated_at', type: 'date' },
    { label: 'Budget Utilization', field: 'budget_utilization', type: 'percentage' }
  ],
  customers: [
    { label: 'Customer ID', field: 'customerid', type: 'text' },
    { label: 'Customer Name', field: 'customername', type: 'text' },
    { label: 'Contact Email', field: 'contactemail', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Address', field: 'address', type: 'text' },
    { label: 'City', field: 'city', type: 'text' },
    { label: 'State', field: 'state', type: 'text' },
    { label: 'Zip', field: 'zip', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Created On', field: 'createdon', type: 'date' },
  ],
  vendors: [
    { label: 'Vendor ID', field: 'vendorid', type: 'text' },
    { label: 'Vendor Name', field: 'vendorname', type: 'text' },
    { label: 'Email', field: 'email', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Address', field: 'address', type: 'text' },
    { label: 'City', field: 'city', type: 'text' },
    { label: 'State', field: 'state', type: 'text' },
    { label: 'Zip', field: 'zip', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Payment Terms', field: 'payment_terms', type: 'text' },
    { label: 'Created On', field: 'createdon', type: 'date' },
  ],
  subcontractors: [
    { label: 'Subcontractor ID', field: 'subid', type: 'text' },
    { label: 'Name', field: 'subname', type: 'text' },
    { label: 'Email', field: 'contactemail', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Address', field: 'address', type: 'text' },
    { label: 'City', field: 'city', type: 'text' },
    { label: 'State', field: 'state', type: 'text' },
    { label: 'Zip', field: 'zip', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Hourly Rate', field: 'hourly_rate', type: 'currency' },
    { label: 'Rating', field: 'rating', type: 'number' },
    { label: 'Insurance Expiration', field: 'insurance_expiration', type: 'date' },
  ],
  work_orders: [
    { label: 'Work Order ID', field: 'work_order_id', type: 'text' },
    { label: 'Title', field: 'title', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Priority', field: 'priority', type: 'status' },
    { label: 'Customer', field: 'customer_id', type: 'text' },
    { label: 'Scheduled Date', field: 'scheduled_date', type: 'date' },
    { label: 'Due By Date', field: 'due_by_date', type: 'date' },
    { label: 'Actual Hours', field: 'actual_hours', type: 'number' },
    { label: 'Materials Cost', field: 'materials_cost', type: 'currency' },
    { label: 'Total Cost', field: 'total_cost', type: 'currency' },
    { label: 'Progress', field: 'progress', type: 'percentage' },
    { label: 'Description', field: 'description', type: 'text' },
    { label: 'Completed Date', field: 'completed_date', type: 'date' },
    { label: 'Time Estimate', field: 'time_estimate', type: 'number' },
    { label: 'PO Number', field: 'po_number', type: 'text' },
    { label: 'Work Order Number', field: 'work_order_number', type: 'text' },
    { label: 'Created At', field: 'created_at', type: 'date' },
    { label: 'Project ID', field: 'project_id', type: 'text' }
  ],
  estimates: [
    { label: 'Estimate ID', field: 'estimateid', type: 'text' },
    { label: 'Project Name', field: 'projectname', type: 'text' },
    { label: 'Customer', field: 'customername', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Estimate Amount', field: 'estimateamount', type: 'currency' },
    { label: 'Contingency', field: 'contingencyamount', type: 'currency' },
    { label: 'Contingency %', field: 'contingency_percentage', type: 'percentage' },
    { label: 'Created Date', field: 'datecreated', type: 'date' },
    { label: 'Sent Date', field: 'sentdate', type: 'date' },
    { label: 'Approved Date', field: 'approveddate', type: 'date' },
    { label: 'Site Location', field: 'sitelocationaddress', type: 'text' },
    { label: 'City', field: 'sitelocationcity', type: 'text' },
    { label: 'State', field: 'sitelocationstate', type: 'text' },
    { label: 'Zip', field: 'sitelocationzip', type: 'text' },
    { label: 'PO #', field: 'po#', type: 'text' },
    { label: 'Job Description', field: 'job description', type: 'text' },
    { label: 'Total With Contingency', field: 'total_with_contingency', type: 'currency' }
  ],
  expenses: [
    { label: 'ID', field: 'id', type: 'text' },
    { label: 'Description', field: 'description', type: 'text' },
    { label: 'Entity Type', field: 'entity_type', type: 'text' },
    { label: 'Entity ID', field: 'entity_id', type: 'text' },
    { label: 'Amount', field: 'amount', type: 'currency' },
    { label: 'Expense Type', field: 'expense_type', type: 'text' },
    { label: 'Vendor', field: 'vendor_id', type: 'text' },
    { label: 'Expense Date', field: 'expense_date', type: 'date' },
    { label: 'Is Billable', field: 'is_billable', type: 'boolean' },
    { label: 'Created At', field: 'created_at', type: 'date' },
    { label: 'Updated At', field: 'updated_at', type: 'date' },
    { label: 'Quantity', field: 'quantity', type: 'number' },
    { label: 'Unit Price', field: 'unit_price', type: 'currency' },
    { label: 'Document ID', field: 'document_id', type: 'text' },
    { label: 'Status', field: 'status', type: 'text' },
    { label: 'Notes', field: 'notes', type: 'text' }
  ],
  time_entries: [
    { label: 'ID', field: 'id', type: 'text' },
    { label: 'Entity Type', field: 'entity_type', type: 'text' },
    { label: 'Entity ID', field: 'entity_id', type: 'text' },
    { label: 'Employee', field: 'employee_id', type: 'text' },
    { label: 'Date Worked', field: 'date_worked', type: 'date' },
    { label: 'Start Time', field: 'start_time', type: 'text' },
    { label: 'End Time', field: 'end_time', type: 'text' },
    { label: 'Hours Worked', field: 'hours_worked', type: 'number' },
    { label: 'Rate', field: 'employee_rate', type: 'currency' },
    { label: 'Total Cost', field: 'total_cost', type: 'currency' },
    { label: 'Notes', field: 'notes', type: 'text' },
    { label: 'Has Receipts', field: 'has_receipts', type: 'boolean' },
    { label: 'Created At', field: 'created_at', type: 'date' }
  ],
  change_orders: [
    { label: 'ID', field: 'id', type: 'text' },
    { label: 'Title', field: 'title', type: 'text' },
    { label: 'Entity Type', field: 'entity_type', type: 'text' },
    { label: 'Entity ID', field: 'entity_id', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Requested By', field: 'requested_by', type: 'text' },
    { label: 'Requested Date', field: 'requested_date', type: 'date' },
    { label: 'Approved By', field: 'approved_by', type: 'text' },
    { label: 'Approved Date', field: 'approved_date', type: 'date' },
    { label: 'Total Amount', field: 'total_amount', type: 'currency' },
    { label: 'Impact Days', field: 'impact_days', type: 'number' },
    { label: 'Change Order Number', field: 'change_order_number', type: 'text' },
    { label: 'Description', field: 'description', type: 'text' },
    { label: 'Created At', field: 'created_at', type: 'date' },
    { label: 'Updated At', field: 'updated_at', type: 'date' }
  ],
  employees: [
    { label: 'Employee ID', field: 'employee_id', type: 'text' },
    { label: 'First Name', field: 'first_name', type: 'text' },
    { label: 'Last Name', field: 'last_name', type: 'text' },
    { label: 'Email', field: 'email', type: 'text' },
    { label: 'Phone', field: 'phone', type: 'text' },
    { label: 'Role', field: 'role', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Hourly Rate', field: 'hourly_rate', type: 'currency' },
    { label: 'Created At', field: 'created_at', type: 'date' },
    { label: 'Updated At', field: 'updated_at', type: 'date' }
  ]
};

// Define entity names for display
const entityNames: Record<EntityType, string> = {
  'projects': 'Projects',
  'customers': 'Customers',
  'vendors': 'Vendors',
  'subcontractors': 'Subcontractors',
  'work_orders': 'Work Orders',
  'estimates': 'Estimates',
  'expenses': 'Expenses',
  'time_entries': 'Time Logs',
  'change_orders': 'Change Orders',
  'employees': 'Employees'
};

// Define entity icons (simple text emojis for now, can be replaced with proper icons)
const entityIcons: Record<EntityType, string> = {
  'projects': '📁',
  'customers': '👥',
  'vendors': '🏢',
  'subcontractors': '👷',
  'work_orders': '🔧',
  'estimates': '📝',
  'expenses': '💰',
  'time_entries': '⏱️',
  'change_orders': '📊',
  'employees': '👤'
};

// Define table names in Supabase - map entity types to actual table names
const entityTableMap: Record<EntityType, string> = {
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

// Helper function for date range processing
const formatDateForQuery = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Define report filters interface
interface ReportFilters {
  search: string;
  dateRange: DateRange | undefined;
  status: string;
  expenseType?: string;
  role?: string;
}

// Define a function to fetch data based on entity type with enhanced filtering
const fetchData = async (entityType: EntityType, filters: ReportFilters) => {
  // Get the actual table name from our mapping
  const tableName = entityTableMap[entityType];
  
  // Build a query based on entity type - use type assertion for tableName
  let query = supabase.from(tableName as any).select('*');
  
  // Apply filters
  if (filters.search) {
    // Apply search filter logic based on entity type
    if (entityType === 'projects') {
      query = query.or(`projectid.ilike.%${filters.search}%,projectname.ilike.%${filters.search}%`);
    } else if (entityType === 'customers') {
      query = query.or(`customerid.ilike.%${filters.search}%,customername.ilike.%${filters.search}%`);
    } else if (entityType === 'vendors') {
      query = query.or(`vendorid.ilike.%${filters.search}%,vendorname.ilike.%${filters.search}%`);
    } else if (entityType === 'subcontractors') {
      query = query.or(`subid.ilike.%${filters.search}%,subname.ilike.%${filters.search}%`);
    } else if (entityType === 'work_orders') {
      query = query.or(`work_order_id::text.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
    } else if (entityType === 'estimates') {
      query = query.or(`estimateid.ilike.%${filters.search}%,projectname.ilike.%${filters.search}%`);
    } else if (entityType === 'expenses') {
      query = query.or(`description.ilike.%${filters.search}%`);
    } else if (entityType === 'time_entries') {
      query = query.or(`id::text.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`);
    } else if (entityType === 'change_orders') {
      query = query.or(`title.ilike.%${filters.search}%,change_order_number.ilike.%${filters.search}%`);
    } else if (entityType === 'employees') {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }
  }
  
  // Date range filter
  if (filters.dateRange?.from) {
    const dateField = getDateFieldForEntity(entityType);
    query = query.gte(dateField, formatDateForQuery(filters.dateRange.from));
  }
  
  if (filters.dateRange?.to) {
    const dateField = getDateFieldForEntity(entityType);
    query = query.lte(dateField, formatDateForQuery(filters.dateRange.to));
  }
  
  // Status filter
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  
  // Add custom entity-specific filters
  if (entityType === 'expenses' && filters.expenseType && filters.expenseType !== 'all') {
    query = query.eq('expense_type', filters.expenseType);
  }
  
  // Employee role filter
  if (entityType === 'employees' && filters.role && filters.role !== 'all') {
    query = query.eq('role', filters.role);
  }
  
  try {
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching ${entityType}:`, error);
      throw error;
    }
    
    // Process data with derived fields based on entity type
    const processedData = processEntityData(entityType, data || []);
    
    return processedData;
  } catch (error) {
    console.error(`Error in fetchData for ${entityType}:`, error);
    throw error;
  }
};

// Get date field name based on entity type for filtering
const getDateFieldForEntity = (entityType: EntityType): string => {
  switch (entityType) {
    case 'projects':
      return 'createdon';
    case 'customers':
      return 'createdon';
    case 'vendors':
      return 'createdon';
    case 'subcontractors':
      return 'created_at';
    case 'work_orders':
      return 'created_at';
    case 'estimates':
      return 'datecreated';
    case 'expenses':
      return 'expense_date';
    case 'time_entries':
      return 'date_worked';
    case 'change_orders':
      return 'created_at';
    case 'employees':
      return 'created_at';
    default:
      return 'created_at';
  }
};

// Process entity data to add derived fields and format data
const processEntityData = (entityType: EntityType, data: any[]): any[] => {
  return data.map(item => {
    const processed = { ...item };
    
    if (entityType === 'projects') {
      // Calculate budget utilization percentage
      if (processed.total_budget && processed.total_budget > 0) {
        processed.budget_utilization = (processed.current_expenses / processed.total_budget) * 100;
      } else {
        processed.budget_utilization = 0;
      }
    }
    
    if (entityType === 'estimates') {
      // Calculate total with contingency
      processed.total_with_contingency = (processed.estimateamount || 0) + (processed.contingencyamount || 0);
    }
    
    if (entityType === 'employees') {
      // Add full name field for convenience
      processed.full_name = `${processed.first_name} ${processed.last_name}`;
    }
    
    return processed;
  });
};

// Helper function to format hours
export function formatHours(hours: number | undefined | null): string {
  if (hours === undefined || hours === null) return '0h';
  
  return `${Number(hours).toFixed(1)}h`;
}

// Helper function to format percentages
export function formatPercentage(percentage: number | undefined | null): string {
  if (percentage === undefined || percentage === null) return '0%';
  
  return `${Number(percentage).toFixed(1)}%`;
}

const Reports = () => {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('projects');
  const [filters, setFilters] = useState<ReportFilters>({
    search: '',
    dateRange: undefined,
    status: 'all'
  });
  const [debouncedFilters, setDebouncedFilters] = useState<ReportFilters>(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Debounce the filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters]);
  
  // Fetch data using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', selectedEntity, debouncedFilters],
    queryFn: () => fetchData(selectedEntity, debouncedFilters),
  });
  
  // Generate columns for the data table based on entity fields
  const columns = entityFields[selectedEntity].map(field => ({
    accessorKey: field.field,
    header: field.label,
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(field.field);
      
      // Format the value based on its type
      if (value === null || value === undefined) {
        return '—';
      }
      
      switch (field.type) {
        case 'date':
          return formatDate(value);
        case 'currency':
          return formatCurrency(value);
        case 'percentage':
          return formatPercentage(value);
        case 'status':
          return (
            <Badge className="capitalize" variant={getStatusVariant(value?.toString().toLowerCase())}>
              {value?.toString().toLowerCase().replace(/_/g, ' ')}
            </Badge>
          );
        case 'boolean':
          return value ? (
            <Badge variant="secondary">Yes</Badge>
          ) : (
            <Badge variant="outline">No</Badge>
          );
        default:
          return value;
      }
    },
  }));
  
  // Determine status variant for styling badges
  const getStatusVariant = (status: string | undefined): "default" | "outline" | "secondary" | "destructive" | "earth" | "sage" => {
    if (!status) return "default";
    
    if (status.includes('active') || status.includes('approved') || status.includes('completed')) {
      return "secondary";
    } else if (status.includes('pending') || status.includes('draft') || status.includes('progress')) {
      return "secondary";
    } else if (status.includes('hold') || status.includes('review')) {
      return "outline";
    } else if (status.includes('cancel') || status.includes('reject')) {
      return "destructive";
    }
    
    return "default";
  };
  
  // Function to handle CSV export
  const exportToCsv = () => {
    if (!data || data.length === 0) return;
    
    // Get the headers
    const headers = entityFields[selectedEntity].map(field => field.label);
    
    // Map the data
    const csvData = data.map((item: any) => {
      return entityFields[selectedEntity].map(field => {
        const value = item[field.field];
        if (value === null || value === undefined) return '';
        
        // Format special types for CSV
        if (field.type === 'date' && value) {
          return formatDate(value);
        } else if (field.type === 'currency' && value !== null) {
          return typeof value === 'number' ? value.toFixed(2) : value;
        } else if (field.type === 'percentage' && value !== null) {
          return typeof value === 'number' ? value.toFixed(2) : value;
        } else if (field.type === 'boolean') {
          return value ? 'Yes' : 'No';
        } else {
          return String(value).replace(/"/g, '""'); // Escape quotes
        }
      });
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create and click a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEntity}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle filter changes
  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Get status options based on the selected entity
  const getStatusOptions = (): { value: string, label: string }[] => {
    const allOption = { value: 'all', label: 'All Statuses' };
    
    switch (selectedEntity) {
      case 'projects':
        return [
          allOption,
          { value: 'new', label: 'New' },
          { value: 'active', label: 'Active' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ];
      case 'work_orders':
        return [
          allOption,
          { value: 'NEW', label: 'New' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'ON_HOLD', label: 'On Hold' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'CANCELLED', label: 'Cancelled' }
        ];
      case 'estimates':
        return [
          allOption,
          { value: 'draft', label: 'Draft' },
          { value: 'sent', label: 'Sent' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'converted', label: 'Converted to Project' }
        ];
      case 'employees':
        return [
          allOption,
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
      default:
        return [
          allOption,
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' }
        ];
    }
  };
  
  // Get role options for employees
  const getRoleOptions = (): { value: string, label: string }[] => {
    return [
      { value: 'all', label: 'All Roles' },
      { value: 'Admin', label: 'Admin' },
      { value: 'Manager', label: 'Manager' },
      { value: 'Technician', label: 'Technician' },
      { value: 'Laborer', label: 'Laborer' },
      { value: 'Office', label: 'Office' }
    ];
  };

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-montserrat text-[#0485ea]">Reports</h1>
            <p className="text-muted-foreground">View and export data across different entities</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline"
              className={showFilters ? "bg-muted" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters {showFilters ? "▼" : "▶"}
            </Button>
            <Button onClick={exportToCsv} className="bg-[#0485ea] hover:bg-[#0370c9]">
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/report-builder'}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Report Builder
            </Button>
          </div>
        </div>
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className={cn(
            "transition-all duration-300 ease-in-out bg-white border-r shadow-sm", 
            sidebarCollapsed ? "w-16" : "w-64"
          )}>
            <div className="flex justify-between items-center p-4 border-b">
              {!sidebarCollapsed && <h3 className="font-medium">Report Types</h3>}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto" 
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            <ScrollArea className="h-[70vh]">
              <div className="space-y-1 p-2">
                {(Object.keys(entityNames) as EntityType[]).map((entity) => (
                  <Button
                    key={entity}
                    variant={selectedEntity === entity ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      sidebarCollapsed ? "px-2 py-2" : "px-4 py-2"
                    )}
                    onClick={() => setSelectedEntity(entity)}
                  >
                    <span className="mr-2">{entityIcons[entity]}</span>
                    {!sidebarCollapsed && <span>{entityNames[entity]}</span>}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 ml-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-medium">{entityNames[selectedEntity]} Report</h2>
                  <div className="relative flex-1 ml-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search ${entityNames[selectedEntity]}...`}
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                {showFilters && (
                  <div className="mb-6 p-4 border rounded-md bg-muted/50">
                    <h3 className="text-sm font-semibold mb-3">Filter Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Date Range Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Date Range</label>
                        <DatePickerWithRange 
                          date={filters.dateRange}
                          onDateChange={(range) => handleFilterChange('dateRange', range)}
                        />
                      </div>
                      
                      {/* Status Filter */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Status</label>
                        <Select
                          value={filters.status}
                          onValueChange={(value) => handleFilterChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {getStatusOptions().map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Entity-specific filters */}
                      {selectedEntity === 'employees' && (
                        <div>
                          <label className="text-sm font-medium mb-1 block">Role</label>
                          <Select
                            value={filters.role || 'all'}
                            onValueChange={(value) => handleFilterChange('role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {getRoleOptions().map(option => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Data Table */}
                {isLoading ? (
                  <div className="py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
                  </div>
                ) : isError ? (
                  <div className="py-10 text-center text-destructive">
                    <p>Error loading data. Please try again.</p>
                  </div>
                ) : data && data.length > 0 ? (
                  <DataTable columns={columns} data={data} />
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground">No data found for the selected filters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reports;
