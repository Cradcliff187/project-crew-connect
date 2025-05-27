import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  User,
  Building2,
  Briefcase,
  DollarSign,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AdminTimeEntryView, TimeEntryFilters } from '@/types/role-based-types';

// Mock data - will be replaced with real data hooks
const mockTimeEntries: AdminTimeEntryView[] = [
  {
    id: '1',
    entity_type: 'project',
    entity_id: 'proj_001',
    entity_name: 'Kitchen Renovation - Phase 2',
    employee_name: 'John Smith',
    date_worked: '2024-01-15',
    start_time: '08:00',
    end_time: '17:00',
    hours_worked: 8.5,
    hours_regular: 8,
    hours_ot: 0.5,
    employee_id: 'emp_001',
    employee_rate: 25,
    cost_rate: 25,
    bill_rate: 45,
    notes: 'Completed cabinet installation',
    has_receipts: true,
    location_data: null,
    total_cost: 212.5,
    total_billable: 382.5,
    project_budget_item_id: null,
    processed_at: null,
    processed_by: null,
    receipt_id: 'receipt_001',
    created_at: '2024-01-15T18:00:00Z',
    updated_at: '2024-01-15T18:00:00Z',
    can_process: true,
  },
  {
    id: '2',
    entity_type: 'work_order',
    entity_id: 'wo_001',
    entity_name: 'HVAC System Maintenance',
    employee_name: 'Jane Doe',
    date_worked: '2024-01-15',
    start_time: '09:00',
    end_time: '15:00',
    hours_worked: 6,
    hours_regular: 6,
    hours_ot: 0,
    employee_id: 'emp_002',
    employee_rate: 30,
    cost_rate: 30,
    bill_rate: 55,
    notes: 'Quarterly maintenance completed',
    has_receipts: false,
    location_data: null,
    total_cost: 180,
    total_billable: 330,
    project_budget_item_id: null,
    processed_at: '2024-01-15T20:00:00Z',
    processed_by: 'admin_001',
    receipt_id: null,
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T20:00:00Z',
    can_process: false,
  },
  {
    id: '3',
    entity_type: 'project',
    entity_id: 'proj_002',
    entity_name: 'Office Building Renovation',
    employee_name: 'Mike Johnson',
    date_worked: '2024-01-14',
    start_time: '07:00',
    end_time: '19:00',
    hours_worked: 11,
    hours_regular: 8,
    hours_ot: 3,
    employee_id: 'emp_003',
    employee_rate: 28,
    cost_rate: 28,
    bill_rate: 50,
    notes: 'Extended work day for deadline',
    has_receipts: true,
    location_data: null,
    total_cost: 392, // 8*28 + 3*42 (1.5x OT)
    total_billable: 625, // 8*50 + 3*75 (1.5x OT)
    project_budget_item_id: null,
    processed_at: null,
    processed_by: null,
    receipt_id: 'receipt_002',
    created_at: '2024-01-14T20:00:00Z',
    updated_at: '2024-01-14T20:00:00Z',
    can_process: true,
  },
];

const AdminTimeEntries: React.FC = () => {
  const { user, role, isAdmin } = useAuth();
  const [timeEntries, setTimeEntries] = useState<AdminTimeEntryView[]>(mockTimeEntries);
  const [filters, setFilters] = useState<TimeEntryFilters>({
    dateRange: { from: null, to: null },
    employee_id: undefined,
    entity_type: undefined,
    processed: undefined,
  });
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              This page is only accessible to administrators.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleProcessEntry = (id: string) => {
    setTimeEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? {
              ...entry,
              processed_at: new Date().toISOString(),
              processed_by: 'current_admin',
              can_process: false,
            }
          : entry
      )
    );
  };

  const handleUnprocessEntry = (id: string) => {
    setTimeEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, processed_at: null, processed_by: null, can_process: true }
          : entry
      )
    );
  };

  const handleBulkProcess = () => {
    const processableEntries = selectedEntries.filter(
      id => timeEntries.find(entry => entry.id === id)?.can_process
    );

    setTimeEntries(prev =>
      prev.map(entry =>
        processableEntries.includes(entry.id)
          ? {
              ...entry,
              processed_at: new Date().toISOString(),
              processed_by: 'current_admin',
              can_process: false,
            }
          : entry
      )
    );

    setSelectedEntries([]);
  };

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const processableIds = timeEntries.filter(entry => entry.can_process).map(entry => entry.id);
    setSelectedEntries(prev => (prev.length === processableIds.length ? [] : processableIds));
  };

  const getEntityIcon = (entityType: string) => {
    return entityType === 'project' ? (
      <Building2 className="h-4 w-4 text-blue-600" />
    ) : (
      <Briefcase className="h-4 w-4 text-green-600" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const unprocessedCount = timeEntries.filter(entry => !entry.processed_at).length;
  const selectedProcessableCount = selectedEntries.filter(
    id => timeEntries.find(entry => entry.id === id)?.can_process
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Clock className="h-8 w-8 mr-3 text-blue-600" />
              Time Entry Management
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Administrator
            </Badge>
          </div>
          <p className="text-gray-600">Review, process, and manage employee time entries</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-blue-900">{unprocessedCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Hours</p>
                  <p className="text-2xl font-bold text-green-900">
                    {timeEntries.reduce((sum, entry) => sum + entry.hours_worked, 0)}
                  </p>
                </div>
                <Timer className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Overtime Hours</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {timeEntries.reduce((sum, entry) => sum + entry.hours_ot, 0)}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Cost</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(
                      timeEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0)
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="employee-filter">Employee</Label>
                <Select
                  value={filters.employee_id || ''}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, employee_id: value || undefined }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All employees</SelectItem>
                    <SelectItem value="emp_001">John Smith</SelectItem>
                    <SelectItem value="emp_002">Jane Doe</SelectItem>
                    <SelectItem value="emp_003">Mike Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entity-filter">Entity Type</Label>
                <Select
                  value={filters.entity_type || ''}
                  onValueChange={value =>
                    setFilters(prev => ({ ...prev, entity_type: value || undefined }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="work_order">Work Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.processed?.toString() || ''}
                  onValueChange={value =>
                    setFilters(prev => ({
                      ...prev,
                      processed: value === '' ? undefined : value === 'true',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                    <SelectItem value="true">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  onClick={handleBulkProcess}
                  disabled={selectedProcessableCount === 0}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Process Selected ({selectedProcessableCount})
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Time Entries</span>
              <Badge variant="secondary">{timeEntries.length} entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedEntries.length > 0 &&
                          selectedEntries.length === timeEntries.filter(e => e.can_process).length
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map(entry => (
                    <TableRow
                      key={entry.id}
                      className={cn(
                        'hover:bg-gray-50',
                        selectedEntries.includes(entry.id) && 'bg-blue-50'
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedEntries.includes(entry.id)}
                          onCheckedChange={() => toggleEntrySelection(entry.id)}
                          disabled={!entry.can_process}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{entry.employee_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{format(new Date(entry.date_worked), 'MMM d, yyyy')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getEntityIcon(entry.entity_type)}
                          <div>
                            <p className="font-medium">{entry.entity_name}</p>
                            <p className="text-sm text-gray-500 capitalize">{entry.entity_type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-medium">{entry.hours_worked}h</p>
                          <p className="text-sm text-gray-500">
                            {entry.start_time} - {entry.end_time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          {entry.hours_ot > 0 ? (
                            <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                              {entry.hours_ot}h OT
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(entry.total_cost || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(entry.total_billable || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {entry.processed_at ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Processed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {entry.can_process ? (
                            <Button
                              size="sm"
                              onClick={() => handleProcessEntry(entry.id)}
                              className="h-8"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Process
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnprocessEntry(entry.id)}
                              className="h-8"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Unprocess
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTimeEntries;
