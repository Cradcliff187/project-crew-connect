
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Filter, Search, FileDown } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';

// Define the types of entities we can report on
type EntityType = 'projects' | 'customers' | 'vendors' | 'subcontractors' | 'work_orders' | 'estimates' | 'expenses';

// Define fields for each entity type
const entityFields: Record<EntityType, { label: string; field: string; type: 'text' | 'date' | 'number' | 'currency' | 'status' }[]> = {
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
    { label: 'Progress', field: 'progress', type: 'number' },
  ],
  estimates: [
    { label: 'Estimate ID', field: 'estimateid', type: 'text' },
    { label: 'Project Name', field: 'projectname', type: 'text' },
    { label: 'Customer', field: 'customername', type: 'text' },
    { label: 'Status', field: 'status', type: 'status' },
    { label: 'Estimate Amount', field: 'estimateamount', type: 'currency' },
    { label: 'Contingency', field: 'contingencyamount', type: 'currency' },
    { label: 'Created Date', field: 'datecreated', type: 'date' },
    { label: 'Sent Date', field: 'sentdate', type: 'date' },
    { label: 'Approved Date', field: 'approveddate', type: 'date' },
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
    { label: 'Is Billable', field: 'is_billable', type: 'status' },
    { label: 'Created At', field: 'created_at', type: 'date' },
  ],
};

// Define a function to fetch data based on entity type
const fetchData = async (entityType: EntityType, searchTerm = '') => {
  // Convert the entity type to the table name in Supabase
  let table = entityType;
  
  // Handle the maintenance_work_orders table name special case
  if (entityType === 'work_orders') {
    table = 'maintenance_work_orders';
  }

  // Build a simple query based on entity type
  let query = supabase.from(table).select('*');
  
  // Add basic filtering if search term is provided
  if (searchTerm) {
    // Basic search based on most common field names
    if (entityType === 'projects') {
      query = query.or(`projectid.ilike.%${searchTerm}%,projectname.ilike.%${searchTerm}%`);
    } else if (entityType === 'customers') {
      query = query.or(`customerid.ilike.%${searchTerm}%,customername.ilike.%${searchTerm}%`);
    } else if (entityType === 'vendors') {
      query = query.or(`vendorid.ilike.%${searchTerm}%,vendorname.ilike.%${searchTerm}%`);
    } else if (entityType === 'subcontractors') {
      query = query.or(`subid.ilike.%${searchTerm}%,subname.ilike.%${searchTerm}%`);
    } else if (entityType === 'work_orders') {
      query = query.or(`title.ilike.%${searchTerm}%`);
    } else if (entityType === 'estimates') {
      query = query.or(`estimateid.ilike.%${searchTerm}%,projectname.ilike.%${searchTerm}%`);
    } else if (entityType === 'expenses') {
      query = query.or(`description.ilike.%${searchTerm}%`);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw error;
  }
  
  return data;
};

const Reports = () => {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Set up debounced search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Fetch data using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reports', selectedEntity, debouncedSearchTerm],
    queryFn: () => fetchData(selectedEntity, debouncedSearchTerm),
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
        case 'status':
          return (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100">
              {value?.toString().toLowerCase().replace(/_/g, ' ')}
            </div>
          );
        default:
          return value;
      }
    },
  }));
  
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
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-montserrat text-[#0485ea]">Reports</h1>
            <p className="text-muted-foreground">View and export data across different entities</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button onClick={exportToCsv}>
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="projects" onValueChange={(value) => setSelectedEntity(value as EntityType)}>
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="subcontractors">Subcontractors</TabsTrigger>
            <TabsTrigger value="work_orders">Work Orders</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          {/* All content areas share the same layout */}
          {(['projects', 'customers', 'vendors', 'subcontractors', 'work_orders', 'estimates', 'expenses'] as EntityType[]).map((entity) => (
            <TabsContent key={entity} value={entity}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={`Search ${entity}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  {showFilters && (
                    <div className="mb-6 p-4 border rounded-md bg-muted/50">
                      <h3 className="text-sm font-medium mb-3">Filter Options</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Status filter */}
                        <div>
                          <label className="text-xs mb-1 block">Status</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Date range filter */}
                        <div>
                          <label className="text-xs mb-1 block">Date Range</label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Any Time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any Time</SelectItem>
                              <SelectItem value="today">Today</SelectItem>
                              <SelectItem value="week">This Week</SelectItem>
                              <SelectItem value="month">This Month</SelectItem>
                              <SelectItem value="quarter">This Quarter</SelectItem>
                              <SelectItem value="year">This Year</SelectItem>
                              <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Entity specific filter */}
                        {entity === 'expenses' && (
                          <div>
                            <label className="text-xs mb-1 block">Expense Type</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="All Types" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="material">Materials</SelectItem>
                                <SelectItem value="labor">Labor</SelectItem>
                                <SelectItem value="service">Services</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <p>Loading data...</p>
                    </div>
                  ) : isError ? (
                    <div className="flex justify-center items-center h-40">
                      <p className="text-destructive">Error loading data. Please try again.</p>
                    </div>
                  ) : data && data.length > 0 ? (
                    <DataTable
                      columns={columns}
                      data={data}
                      filterColumn={entityFields[entity][1].field} // Use second field for filtering (usually name)
                      searchPlaceholder={`Filter ${entity}...`}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-40">
                      <p>No data available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Summary Section */}
        {data && data.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="text-2xl font-bold">{data.length}</div>
                  <div className="text-sm text-muted-foreground capitalize">Total {selectedEntity}</div>
                </div>
                
                {selectedEntity === 'projects' && (
                  <>
                    <div className="p-4 border rounded-md">
                      <div className="text-2xl font-bold">
                        {formatCurrency(data.reduce((sum: number, item: any) => sum + (parseFloat(item.total_budget) || 0), 0))}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <div className="text-2xl font-bold">
                        {formatCurrency(data.reduce((sum: number, item: any) => sum + (parseFloat(item.current_expenses) || 0), 0))}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Expenses</div>
                    </div>
                  </>
                )}
                
                {selectedEntity === 'expenses' && (
                  <div className="p-4 border rounded-md">
                    <div className="text-2xl font-bold">
                      {formatCurrency(data.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default Reports;
