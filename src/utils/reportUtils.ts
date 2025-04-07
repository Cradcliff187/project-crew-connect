
import { supabase } from '@/integrations/supabase/client';
import { EntityType, FieldDefinition, ReportFilters } from '@/types/reports';
import { entityTableMap } from '@/data/reportEntities';
import { formatDate, formatCurrency } from '@/lib/utils';

// Helper function for date range processing
export const formatDateForQuery = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get date field name based on entity type for filtering
export const getDateFieldForEntity = (entityType: EntityType): string => {
  switch (entityType) {
    case 'projects': return 'createdon';
    case 'customers': return 'createdon';
    case 'vendors': return 'createdon';
    case 'subcontractors': return 'created_at';
    case 'work_orders': return 'created_at';
    case 'estimates': return 'datecreated';
    case 'expenses': return 'expense_date';
    case 'time_entries': return 'date_worked';
    case 'change_orders': return 'created_at';
    case 'employees': return 'created_at';
    default: return 'created_at';
  }
};

// Process entity data to add derived fields and format data
export const processEntityData = (entityType: EntityType, data: any[]): any[] => {
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

// Generate columns for data table based on field definitions
export const generateTableColumns = (fields: FieldDefinition[]) => {
  return fields.map(field => ({
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
          return getStatusBadge(value?.toString().toLowerCase());
        case 'boolean':
          return value ? "Yes" : "No";
        default:
          return value;
      }
    },
  }));
};

// Helper function to format hours
export const formatHours = (hours: number | undefined | null): string => {
  if (hours === undefined || hours === null) return '0h';
  return `${Number(hours).toFixed(1)}h`;
};

// Helper function to format percentages
export const formatPercentage = (percentage: number | undefined | null): string => {
  if (percentage === undefined || percentage === null) return '0%';
  return `${Number(percentage).toFixed(1)}%`;
};

// Get appropriate CSS variant for status badges
export const getStatusVariant = (status?: string): "default" | "outline" | "secondary" | "destructive" | "earth" | "sage" => {
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

// Get JSX for status badge
export const getStatusBadge = (status?: string) => {
  // This is a placeholder - in a full implementation you'd return a proper Badge component
  // We're avoiding importing React components here to keep this as a pure utility file
  return `<Badge variant="${getStatusVariant(status)}">${status?.replace(/_/g, ' ')}</Badge>`;
};

// Define function to fetch data based on entity type with enhanced filtering
export const fetchReportData = async (entityType: EntityType, filters: ReportFilters) => {
  // Get the actual table name from our mapping
  const tableName = entityTableMap[entityType];
  
  // Build a query - use type assertion to work around the TypeScript type checking
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

// Function to generate SQL query from report config
export const generateSqlQuery = (config: any) => {
  const { primaryEntity, selectedFields, filters, groupByField, sortByField, sortDirection } = config;
  
  let query = `SELECT `;
  
  if (!selectedFields || selectedFields.length === 0) {
    query += '*';
  } else {
    query += selectedFields.map((field: any) => field.name || field.field).join(', ');
  }
  
  query += ` FROM ${primaryEntity}`;
  
  if (filters && filters.length > 0) {
    query += ` WHERE `;
    query += filters.map((filter: any, index: number) => {
      let clause = '';
      if (index > 0) clause += ' AND ';
      
      const fieldName = filter.field.name || filter.field.field;
      clause += `${fieldName} `;
      
      switch (filter.operator) {
        case 'equals': clause += `= '${filter.value}'`; break;
        case 'notEquals': clause += `<> '${filter.value}'`; break;
        case 'contains': clause += `LIKE '%${filter.value}%'`; break;
        case 'startsWith': clause += `LIKE '${filter.value}%'`; break;
        case 'greaterThan': clause += `> '${filter.value}'`; break;
        case 'lessThan': clause += `< '${filter.value}'`; break;
        default: clause += `= '${filter.value}'`; break;
      }
      
      return clause;
    }).join('');
  }
  
  if (groupByField) {
    query += ` GROUP BY ${groupByField.name || groupByField.field}`;
  }
  
  if (sortByField) {
    query += ` ORDER BY ${sortByField.name || sortByField.field} ${sortDirection}`;
  }
  
  return query;
};
