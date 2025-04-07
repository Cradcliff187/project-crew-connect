import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowDown, 
  ArrowRight, 
  BarChart3, 
  CircleDollarSign, 
  Download, 
  FileDown, 
  LineChart, 
  ListFilter, 
  PieChart, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDate, formatCurrency } from '@/lib/utils';

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

type EntityType = 'projects' | 'work_orders' | 'estimates' | 'expenses' | 'time_entries' | 'change_orders';

type FieldType = 'text' | 'date' | 'number' | 'currency' | 'status' | 'percentage' | 'boolean';

interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  entity: EntityType;
}

interface FilterDefinition {
  id: string;
  field: FieldDefinition;
  operator: string;
  value: string;
}

const entities: Record<EntityType, string> = {
  'projects': 'Projects',
  'work_orders': 'Work Orders',
  'estimates': 'Estimates',
  'expenses': 'Expenses',
  'time_entries': 'Time Logs',
  'change_orders': 'Change Orders'
};

const chartTypes = [
  { value: 'table', label: 'Table', icon: <ListFilter className="h-4 w-4" /> },
  { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> }
];

const entityFields: Record<EntityType, FieldDefinition[]> = {
  projects: [
    { name: 'projectid', label: 'Project ID', type: 'text', entity: 'projects' },
    { name: 'projectname', label: 'Project Name', type: 'text', entity: 'projects' },
    { name: 'status', label: 'Status', type: 'status', entity: 'projects' },
    { name: 'customername', label: 'Customer', type: 'text', entity: 'projects' },
    { name: 'createdon', label: 'Created On', type: 'date', entity: 'projects' },
    { name: 'total_budget', label: 'Total Budget', type: 'currency', entity: 'projects' },
    { name: 'current_expenses', label: 'Current Expenses', type: 'currency', entity: 'projects' },
    { name: 'budget_status', label: 'Budget Status', type: 'status', entity: 'projects' },
    { name: 'due_date', label: 'Due Date', type: 'date', entity: 'projects' }
  ],
  work_orders: [
    { name: 'work_order_id', label: 'Work Order ID', type: 'text', entity: 'work_orders' },
    { name: 'title', label: 'Title', type: 'text', entity: 'work_orders' },
    { name: 'status', label: 'Status', type: 'status', entity: 'work_orders' },
    { name: 'priority', label: 'Priority', type: 'status', entity: 'work_orders' },
    { name: 'actual_hours', label: 'Actual Hours', type: 'number', entity: 'work_orders' },
    { name: 'materials_cost', label: 'Materials Cost', type: 'currency', entity: 'work_orders' },
    { name: 'total_cost', label: 'Total Cost', type: 'currency', entity: 'work_orders' },
    { name: 'progress', label: 'Progress', type: 'percentage', entity: 'work_orders' }
  ],
  estimates: [
    { name: 'estimateid', label: 'Estimate ID', type: 'text', entity: 'estimates' },
    { name: 'projectname', label: 'Project Name', type: 'text', entity: 'estimates' },
    { name: 'customername', label: 'Customer', type: 'text', entity: 'estimates' },
    { name: 'status', label: 'Status', type: 'status', entity: 'estimates' },
    { name: 'estimateamount', label: 'Estimate Amount', type: 'currency', entity: 'estimates' },
    { name: 'contingencyamount', label: 'Contingency', type: 'currency', entity: 'estimates' },
    { name: 'datecreated', label: 'Created Date', type: 'date', entity: 'estimates' }
  ],
  expenses: [
    { name: 'id', label: 'ID', type: 'text', entity: 'expenses' },
    { name: 'description', label: 'Description', type: 'text', entity: 'expenses' },
    { name: 'entity_type', label: 'Entity Type', type: 'text', entity: 'expenses' },
    { name: 'entity_id', label: 'Entity ID', type: 'text', entity: 'expenses' },
    { name: 'amount', label: 'Amount', type: 'currency', entity: 'expenses' },
    { name: 'expense_type', label: 'Expense Type', type: 'text', entity: 'expenses' },
    { name: 'expense_date', label: 'Expense Date', type: 'date', entity: 'expenses' },
    { name: 'is_billable', label: 'Is Billable', type: 'boolean', entity: 'expenses' }
  ],
  time_entries: [
    { name: 'id', label: 'ID', type: 'text', entity: 'time_entries' },
    { name: 'entity_type', label: 'Entity Type', type: 'text', entity: 'time_entries' },
    { name: 'entity_id', label: 'Entity ID', type: 'text', entity: 'time_entries' },
    { name: 'employee_id', label: 'Employee', type: 'text', entity: 'time_entries' },
    { name: 'date_worked', label: 'Date Worked', type: 'date', entity: 'time_entries' },
    { name: 'hours_worked', label: 'Hours Worked', type: 'number', entity: 'time_entries' },
    { name: 'employee_rate', label: 'Rate', type: 'currency', entity: 'time_entries' },
    { name: 'total_cost', label: 'Total Cost', type: 'currency', entity: 'time_entries' }
  ],
  change_orders: [
    { name: 'id', label: 'ID', type: 'text', entity: 'change_orders' },
    { name: 'title', label: 'Title', type: 'text', entity: 'change_orders' },
    { name: 'entity_type', label: 'Entity Type', type: 'text', entity: 'change_orders' },
    { name: 'entity_id', label: 'Entity ID', type: 'text', entity: 'change_orders' },
    { name: 'status', label: 'Status', type: 'status', entity: 'change_orders' },
    { name: 'total_amount', label: 'Total Amount', type: 'currency', entity: 'change_orders' },
    { name: 'impact_days', label: 'Impact Days', type: 'number', entity: 'change_orders' },
    { name: 'created_at', label: 'Created At', type: 'date', entity: 'change_orders' }
  ]
};

interface ReportConfig {
  name: string;
  description: string;
  primaryEntity: EntityType;
  selectedFields: FieldDefinition[];
  filters: FilterDefinition[];
  groupByField?: FieldDefinition;
  chartType: string;
  sortByField?: FieldDefinition;
  sortDirection: 'asc' | 'desc';
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

const ReportBuilder = () => {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: 'New Report',
    description: 'Report description',
    primaryEntity: 'projects',
    selectedFields: [],
    filters: [],
    chartType: 'table',
    sortDirection: 'desc'
  });
  
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const [currentFilter, setCurrentFilter] = useState<Partial<FilterDefinition>>({
    id: '',
    field: undefined,
    operator: 'equals',
    value: ''
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleEntityChange = (entity: EntityType) => {
    setReportConfig(prev => ({
      ...prev,
      primaryEntity: entity,
      selectedFields: [],
      filters: [],
      groupByField: undefined,
      sortByField: undefined
    }));
  };
  
  const handleAddField = (field: FieldDefinition) => {
    if (reportConfig.selectedFields.some(f => f.name === field.name && f.entity === field.entity)) {
      return;
    }
    
    setReportConfig(prev => ({
      ...prev,
      selectedFields: [...prev.selectedFields, field]
    }));
  };
  
  const handleRemoveField = (index: number) => {
    const newFields = [...reportConfig.selectedFields];
    newFields.splice(index, 1);
    
    const removedField = reportConfig.selectedFields[index];
    
    setReportConfig(prev => ({
      ...prev,
      selectedFields: newFields,
      groupByField: prev.groupByField?.name === removedField.name ? undefined : prev.groupByField,
      sortByField: prev.sortByField?.name === removedField.name ? undefined : prev.sortByField
    }));
  };
  
  const handleAddFilter = () => {
    if (!currentFilter.field) return;
    
    const newFilter: FilterDefinition = {
      id: `filter-${Date.now()}`,
      field: currentFilter.field as FieldDefinition,
      operator: currentFilter.operator || 'equals',
      value: currentFilter.value || ''
    };
    
    setReportConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
    
    setCurrentFilter({
      id: '',
      field: undefined,
      operator: 'equals',
      value: ''
    });
  };
  
  const handleRemoveFilter = (id: string) => {
    setReportConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== id)
    }));
  };
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    setReportConfig(prev => {
      const oldIndex = prev.selectedFields.findIndex(field => 
        `${field.entity}-${field.name}` === active.id
      );
      const newIndex = prev.selectedFields.findIndex(field => 
        `${field.entity}-${field.name}` === over.id
      );
      
      return {
        ...prev,
        selectedFields: arrayMove(prev.selectedFields, oldIndex, newIndex)
      };
    });
  };
  
  const generateQuery = () => {
    const { primaryEntity, selectedFields, filters, groupByField, sortByField, sortDirection } = reportConfig;
    
    let query = `SELECT `;
    
    if (selectedFields.length === 0) {
      query += '*';
    } else {
      query += selectedFields.map(field => field.name).join(', ');
    }
    
    query += ` FROM ${primaryEntity}`;
    
    if (filters.length > 0) {
      query += ` WHERE `;
      query += filters.map((filter, index) => {
        let clause = '';
        if (index > 0) clause += ' AND ';
        
        clause += `${filter.field.name} `;
        
        switch (filter.operator) {
          case 'equals':
            clause += `= '${filter.value}'`;
            break;
          case 'notEquals':
            clause += `<> '${filter.value}'`;
            break;
          case 'contains':
            clause += `LIKE '%${filter.value}%'`;
            break;
          case 'startsWith':
            clause += `LIKE '${filter.value}%'`;
            break;
          case 'greaterThan':
            clause += `> '${filter.value}'`;
            break;
          case 'lessThan':
            clause += `< '${filter.value}'`;
            break;
        }
        
        return clause;
      }).join('');
    }
    
    if (groupByField) {
      query += ` GROUP BY ${groupByField.name}`;
    }
    
    if (sortByField) {
      query += ` ORDER BY ${sortByField.name} ${sortDirection}`;
    }
    
    return query;
  };
  
  const handleGeneratePreview = () => {
    let dummyData: any[] = [];
    
    switch (reportConfig.primaryEntity) {
      case 'projects':
        dummyData = [
          { projectid: 'PRJ-000001', projectname: 'New Office Building', status: 'active', customername: 'ABC Corp', createdon: '2024-01-15', total_budget: 150000, current_expenses: 75000 },
          { projectid: 'PRJ-000002', projectname: 'Home Renovation', status: 'completed', customername: 'John Smith', createdon: '2023-11-20', total_budget: 35000, current_expenses: 34000 },
          { projectid: 'PRJ-000003', projectname: 'Restaurant Remodel', status: 'on_hold', customername: 'Taste of Italy', createdon: '2024-02-05', total_budget: 85000, current_expenses: 15000 }
        ];
        break;
      case 'work_orders':
        dummyData = [
          { work_order_id: 'WO-001', title: 'Fix Plumbing', status: 'IN_PROGRESS', priority: 'HIGH', actual_hours: 4.5, materials_cost: 350, total_cost: 750, progress: 65 },
          { work_order_id: 'WO-002', title: 'Electrical Repair', status: 'COMPLETED', priority: 'MEDIUM', actual_hours: 2.0, materials_cost: 125, total_cost: 275, progress: 100 },
          { work_order_id: 'WO-003', title: 'Paint Room', status: 'NEW', priority: 'LOW', actual_hours: 0, materials_cost: 0, total_cost: 0, progress: 0 }
        ];
        break;
    }
    
    if (reportConfig.selectedFields.length > 0) {
      const fieldNames = reportConfig.selectedFields.map(field => field.name);
      dummyData = dummyData.map(item => {
        const filtered: any = {};
        fieldNames.forEach(name => {
          if (item[name] !== undefined) {
            filtered[name] = item[name];
          }
        });
        return filtered;
      });
    }
    
    setPreviewData(dummyData);
    setIsPreviewMode(true);
  };
  
  const previewColumns = reportConfig.selectedFields.map(field => ({
    accessorKey: field.name,
    header: field.label,
    cell: ({ row }: { row: any }) => {
      const value = row.getValue(field.name);
      
      if (value === null || value === undefined) {
        return '—';
      }
      
      switch (field.type) {
        case 'date':
          return formatDate(value);
        case 'currency':
          return formatCurrency(value);
        case 'percentage':
          return `${value}%`;
        case 'status':
          return (
            <Badge className="capitalize">
              {value?.toString().toLowerCase().replace(/_/g, ' ')}
            </Badge>
          );
        case 'boolean':
          return value ? 'Yes' : 'No';
        default:
          return value;
      }
    },
  }));
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold font-montserrat text-[#0485ea]">Report Builder</h1>
            <p className="text-muted-foreground">Create customized reports based on your data</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isPreviewMode ? "default" : "outline"} 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              {isPreviewMode ? "Edit Report" : "Preview Report"}
            </Button>
            <Button className="bg-[#0485ea] hover:bg-[#0370c9]">
              Save Report
            </Button>
          </div>
        </div>
        
        {isPreviewMode ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{reportConfig.name}</CardTitle>
                <CardDescription>{reportConfig.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportConfig.chartType === 'table' ? (
                  previewData.length > 0 ? (
                    <DataTable
                      columns={previewColumns}
                      data={previewData}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40 border rounded-md">
                      <p className="text-muted-foreground">No data to display</p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-80 border rounded-md">
                    <div className="text-center">
                      <p className="text-muted-foreground">Chart preview placeholder</p>
                      <p className="text-sm text-muted-foreground">
                        {reportConfig.chartType.charAt(0).toUpperCase() + reportConfig.chartType.slice(1)} chart
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-sm text-muted-foreground">
                  {previewData.length} records
                </div>
                <Button variant="outline" onClick={() => console.log("Export")}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>SQL Query</CardTitle>
                <CardDescription>The generated SQL query for this report</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                  {generateQuery()}
                </pre>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input 
                      id="report-name" 
                      value={reportConfig.name} 
                      onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report-description">Description</Label>
                    <Input 
                      id="report-description" 
                      value={reportConfig.description} 
                      onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Primary Entity</CardTitle>
                  <CardDescription>Select the main data entity for this report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Select
                      value={reportConfig.primaryEntity}
                      onValueChange={(value) => handleEntityChange(value as EntityType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an entity" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(entities).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Available Fields</CardTitle>
                  <CardDescription>Click to add fields to your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {entityFields[reportConfig.primaryEntity].map((field) => (
                      <Button
                        key={field.name}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleAddField(field)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {field.label}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Visualization</CardTitle>
                  <CardDescription>Select how to display your report data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Chart Type</Label>
                      <Select
                        value={reportConfig.chartType}
                        onValueChange={(value) => setReportConfig(prev => ({ ...prev, chartType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select chart type" />
                        </SelectTrigger>
                        <SelectContent>
                          {chartTypes.map(chart => (
                            <SelectItem key={chart.value} value={chart.value}>
                              <div className="flex items-center">
                                {chart.icon}
                                <span className="ml-2">{chart.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Selected Fields</CardTitle>
                    <CardDescription>Drag to reorder</CardDescription>
                  </div>
                  <Badge variant="outline">{reportConfig.selectedFields.length}</Badge>
                </CardHeader>
                <CardContent>
                  {reportConfig.selectedFields.length === 0 ? (
                    <div className="flex items-center justify-center h-32 border border-dashed rounded-md">
                      <p className="text-sm text-muted-foreground">No fields selected</p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={reportConfig.selectedFields.map(field => `${field.entity}-${field.name}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {reportConfig.selectedFields.map((field, index) => (
                            <SortableItem key={`${field.entity}-${field.name}`} id={`${field.entity}-${field.name}`}>
                              <div className="flex items-center justify-between p-2 border rounded-md bg-background">
                                <div className="flex items-center">
                                  <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{field.label}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveField(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sorting & Grouping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select
                      value={reportConfig.sortByField?.name || "none"}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setReportConfig(prev => ({
                            ...prev,
                            sortByField: undefined
                          }));
                          return;
                        }
                        
                        const field = reportConfig.selectedFields.find(f => f.name === value);
                        setReportConfig(prev => ({
                          ...prev,
                          sortByField: field
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {reportConfig.selectedFields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {reportConfig.sortByField && (
                    <div className="flex items-center space-x-2">
                      <Label>Order</Label>
                      <Select
                        value={reportConfig.sortDirection}
                        onValueChange={(value: 'asc' | 'desc') => {
                          setReportConfig(prev => ({
                            ...prev,
                            sortDirection: value
                          }));
                        }}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Group By</Label>
                    <Select
                      value={reportConfig.groupByField?.name || "none"}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setReportConfig(prev => ({
                            ...prev,
                            groupByField: undefined
                          }));
                          return;
                        }
                        
                        const field = reportConfig.selectedFields.find(f => f.name === value);
                        setReportConfig(prev => ({
                          ...prev,
                          groupByField: field
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {reportConfig.selectedFields.map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>Filter the data in your report</CardDescription>
                  </div>
                  <Badge variant="outline">{reportConfig.filters.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 p-4 border rounded-md">
                    <div className="space-y-2">
                      <Label>Field</Label>
                      <Select
                        value={currentFilter.field?.name || ''}
                        onValueChange={(value) => {
                          const field = entityFields[reportConfig.primaryEntity].find(f => f.name === value);
                          setCurrentFilter(prev => ({
                            ...prev,
                            field
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {entityFields[reportConfig.primaryEntity].map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={currentFilter.operator || 'equals'}
                        onValueChange={(value) => {
                          setCurrentFilter(prev => ({
                            ...prev,
                            operator: value
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="notEquals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="startsWith">Starts With</SelectItem>
                          <SelectItem value="greaterThan">Greater Than</SelectItem>
                          <SelectItem value="lessThan">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        value={currentFilter.value || ''}
                        onChange={(e) => {
                          setCurrentFilter(prev => ({
                            ...prev,
                            value: e.target.value
                          }));
                        }}
                      />
                    </div>
                    
                    <Button className="w-full" onClick={handleAddFilter}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </div>
                  
                  {reportConfig.filters.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Active Filters</div>
                      <div className="space-y-2">
                        {reportConfig.filters.map(filter => (
                          <div key={filter.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                            <div className="text-sm">
                              <span className="font-medium">{filter.field.label}</span>
                              <span className="mx-1 text-muted-foreground">
                                {filter.operator === 'equals' && '='}
                                {filter.operator === 'notEquals' && '≠'}
                                {filter.operator === 'contains' && 'contains'}
                                {filter.operator === 'startsWith' && 'starts with'}
                                {filter.operator === 'greaterThan' && '>'}
                                {filter.operator === 'lessThan' && '<'}
                              </span>
                              <span className="font-medium">{filter.value}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFilter(filter.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                  <CardDescription>Generate a preview of your report</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-8 bg-muted/20 border border-dashed rounded-md text-center">
                    <CircleDollarSign className="h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-semibold">Configure Your Report</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1 mb-4">
                      Add fields, apply filters, and configure visualization options.
                    </p>
                    <Button onClick={handleGeneratePreview} disabled={reportConfig.selectedFields.length === 0}>
                      Generate Preview
                    </Button>
                    {reportConfig.selectedFields.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">Please select at least one field</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Selected Entity</div>
                    <div className="p-3 bg-background border rounded-md">
                      <div className="flex items-center">
                        <ListFilter className="h-5 w-5 mr-2 text-[#0485ea]" />
                        <span>{entities[reportConfig.primaryEntity]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Fields Selected</div>
                    <div className="p-3 bg-background border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ArrowRight className="h-5 w-5 mr-2 text-[#0485ea]" />
                          <span>{reportConfig.selectedFields.length} fields selected</span>
                        </div>
                        {reportConfig.selectedFields.length > 0 && (
                          <Badge variant="outline" className="bg-[#0485ea]/10">
                            {reportConfig.selectedFields.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">SQL Query</div>
                    <div className="p-3 bg-muted/30 border rounded-md">
                      <pre className="text-xs overflow-auto max-h-32">
                        {generateQuery()}
                      </pre>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-[#0485ea] hover:bg-[#0370c9]"
                    onClick={handleGeneratePreview}
                    disabled={reportConfig.selectedFields.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ReportBuilder;
