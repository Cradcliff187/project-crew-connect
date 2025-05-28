import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedTimeEntries } from '@/hooks/useRoleBasedTimeEntries';
import { useEmployees } from '@/hooks/useEmployees';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Loader2,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TimeEntryFilters, RoleBasedTimeEntry } from '@/types/role-based-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AdminTimeEntries: React.FC = () => {
  const { user, role, isAdmin } = useAuth();
  const [filters, setFilters] = useState<TimeEntryFilters>({
    dateRange: { from: null, to: null },
    employee_id: undefined,
    entity_type: undefined,
    processed: undefined,
  });
  const { timeEntries, isLoading, error, processTimeEntry, unprocessTimeEntry, refetch } =
    useRoleBasedTimeEntries(filters);
  const { employees, isLoadingEmployees } = useEmployees();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<RoleBasedTimeEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    date_worked: '',
    start_time: '',
    end_time: '',
    hours_worked: 0,
    notes: '',
  });

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

  const handleProcessEntry = async (id: string) => {
    try {
      await processTimeEntry(id);
      setSelectedEntries(prev => prev.filter(entryId => entryId !== id));
    } catch (error) {
      console.error('Error processing entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to process time entry',
        variant: 'destructive',
      });
    }
  };

  const handleUnprocessEntry = async (id: string) => {
    try {
      await unprocessTimeEntry(id);
    } catch (error) {
      console.error('Error unprocessing entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to unprocess time entry',
        variant: 'destructive',
      });
    }
  };

  const handleBulkProcess = async () => {
    const processableEntries = selectedEntries.filter(id =>
      timeEntries.find(entry => entry.id === id && !entry.processed_at)
    );

    try {
      await Promise.all(processableEntries.map(id => processTimeEntry(id)));
      setSelectedEntries([]);
      toast({
        title: 'Success',
        description: `Processed ${processableEntries.length} time entries`,
      });
    } catch (error) {
      console.error('Error bulk processing entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to process selected entries',
        variant: 'destructive',
      });
    }
  };

  const calculateHoursFromTimes = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);

    if (end <= start) {
      // Handle overnight shifts
      end.setDate(end.getDate() + 1);
    }

    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  };

  const handleEditEntry = (entry: RoleBasedTimeEntry) => {
    setEditingEntry(entry);
    setEditForm({
      date_worked: entry.date_worked,
      start_time: entry.start_time,
      end_time: entry.end_time,
      hours_worked: entry.hours_worked,
      notes: entry.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingEntry(null);
    setIsEditDialogOpen(false);
    setEditForm({
      date_worked: '',
      start_time: '',
      end_time: '',
      hours_worked: 0,
      notes: '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setIsSaving(true);
    try {
      // Calculate hours if times are provided
      let finalHours = editForm.hours_worked;
      if (editForm.start_time && editForm.end_time) {
        finalHours = calculateHoursFromTimes(editForm.start_time, editForm.end_time);
      }

      const { error } = await supabase
        .from('time_entries')
        .update({
          date_worked: editForm.date_worked,
          start_time: editForm.start_time,
          end_time: editForm.end_time,
          hours_worked: finalHours,
          notes: editForm.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Time entry updated successfully',
      });

      // Refresh the data
      await refetch();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update time entry',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = (field: string, value: string | number) => {
    setEditForm(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate hours when times change
      if (field === 'start_time' || field === 'end_time') {
        if (updated.start_time && updated.end_time) {
          updated.hours_worked = calculateHoursFromTimes(updated.start_time, updated.end_time);
        }
      }

      return updated;
    });
  };

  const toggleEntrySelection = (id: string) => {
    setSelectedEntries(prev =>
      prev.includes(id) ? prev.filter(entryId => entryId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const processableIds = timeEntries.filter(entry => !entry.processed_at).map(entry => entry.id);
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
  const selectedProcessableCount = selectedEntries.filter(id =>
    timeEntries.find(entry => entry.id === id && !entry.processed_at)
  ).length;

  // Calculate summary statistics
  const summaryStats = {
    totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours_worked, 0),
    overtimeHours: timeEntries.reduce((sum, entry) => sum + entry.hours_ot, 0),
    totalCost: timeEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0),
    totalBillable: timeEntries.reduce((sum, entry) => sum + (entry.total_billable || 0), 0),
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error Loading Data</CardTitle>
            <CardDescription className="text-center">{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
                    {summaryStats.totalHours.toFixed(1)}
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
                    {summaryStats.overtimeHours.toFixed(1)}
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
                    {formatCurrency(summaryStats.totalCost)}
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
                  value={filters.employee_id || 'all'}
                  onValueChange={value =>
                    setFilters(prev => ({
                      ...prev,
                      employee_id: value === 'all' ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All employees</SelectItem>
                    {isLoadingEmployees ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading employees...
                      </SelectItem>
                    ) : (
                      employees.map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name || `${employee.firstName} ${employee.lastName}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entity-filter">Entity Type</Label>
                <Select
                  value={filters.entity_type || 'all'}
                  onValueChange={value =>
                    setFilters(prev => ({
                      ...prev,
                      entity_type: value === 'all' ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="project">Projects</SelectItem>
                    <SelectItem value="work_order">Work Orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.processed === undefined ? 'all' : filters.processed.toString()}
                  onValueChange={value =>
                    setFilters(prev => ({
                      ...prev,
                      processed: value === 'all' ? undefined : value === 'true',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                    <SelectItem value="true">Processed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end space-x-2">
                <Button
                  onClick={handleBulkProcess}
                  disabled={selectedProcessableCount === 0 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading time entries...</span>
              </div>
            ) : timeEntries.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
                <p className="text-gray-600">No time entries match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedEntries.length > 0 &&
                            selectedEntries.length ===
                              timeEntries.filter(e => !e.processed_at).length
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
                    {timeEntries.map(entry => {
                      const isSelected = selectedEntries.includes(entry.id);
                      const isProcessed = !!entry.processed_at;

                      return (
                        <TableRow
                          key={entry.id}
                          className={cn('hover:bg-gray-50', isSelected && 'bg-blue-50')}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleEntrySelection(entry.id)}
                              disabled={isProcessed}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {(entry as any).employee_name || 'Unknown'}
                              </span>
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
                                <p className="font-medium">
                                  {(entry as any).entity_name || entry.entity_id}
                                </p>
                                <p className="text-sm text-gray-500 capitalize">
                                  {entry.entity_type}
                                </p>
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
                                <Badge
                                  variant="destructive"
                                  className="bg-orange-100 text-orange-800"
                                >
                                  {entry.hours_ot}h OT
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatCurrency(entry.total_cost || 0)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              {formatCurrency(entry.total_billable || 0)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {isProcessed ? (
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
                              {!isProcessed ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessEntry(entry.id)}
                                  className={cn(
                                    'h-8',
                                    !isSelected &&
                                      'bg-gray-300 text-gray-500 hover:bg-gray-400 hover:text-gray-600'
                                  )}
                                  disabled={isLoading}
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
                                  disabled={isLoading}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unprocess
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditEntry(entry)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>
                Modify the details of this time entry. Changes will be saved to the database.
              </DialogDescription>
            </DialogHeader>
            {editingEntry && (
              <div className="space-y-6">
                {/* Read-only info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Employee</Label>
                    <p className="text-sm font-medium">{(editingEntry as any).employee_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Entity</Label>
                    <p className="text-sm font-medium">
                      {(editingEntry as any).entity_name || editingEntry.entity_id}
                    </p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-date">Work Date</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={editForm.date_worked}
                      onChange={e => handleFormChange('date_worked', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-hours">Hours Worked</Label>
                    <Input
                      id="edit-hours"
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={editForm.hours_worked}
                      onChange={e =>
                        handleFormChange('hours_worked', parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-start-time">Start Time</Label>
                    <Input
                      id="edit-start-time"
                      type="time"
                      value={editForm.start_time}
                      onChange={e => handleFormChange('start_time', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end-time">End Time</Label>
                    <Input
                      id="edit-end-time"
                      type="time"
                      value={editForm.end_time}
                      onChange={e => handleFormChange('end_time', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    placeholder="Add any notes about this time entry..."
                    value={editForm.notes}
                    onChange={e => handleFormChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Auto-calculation notice */}
                {editForm.start_time && editForm.end_time && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Hours will be automatically calculated from start and end times:{' '}
                      {editForm.hours_worked}h
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseEditDialog} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTimeEntries;
