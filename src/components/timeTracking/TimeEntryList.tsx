import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatTime } from './utils/timeUtils';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Edit, Trash, Receipt, Clock, User, Loader2, Building, Briefcase } from 'lucide-react';
import TimeEntryDeleteDialog from './TimeEntryDeleteDialog';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import { useTimeEntryOperations } from './hooks/useTimeEntryOperations';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Employee } from '@/types/common';
import { getEmployeeFullName } from '@/utils/employeeAdapter';
import { TimeEntry } from '@/types/timeTracking';
import { useEmployees } from '@/hooks/useEmployees';
import { Link } from 'react-router-dom';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  employees: Employee[];
  viewMode?: 'admin' | 'field';
  showDate?: boolean;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (entry: TimeEntry) => void;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  employees,
  viewMode = 'admin',
  showDate = true,
  onEditEntry,
  onDeleteEntry,
}) => {
  const isLoading = false;
  const currentEmployees = employees;

  const sortedEntries = Array.isArray(timeEntries)
    ? [...timeEntries].sort(
        (a, b) => new Date(b.date_worked).getTime() - new Date(a.date_worked).getTime()
      )
    : [];

  const getEmployeeById = (employeeId: string): Employee | undefined => {
    if (!employeeId || !Array.isArray(currentEmployees)) return undefined;
    return currentEmployees.find(emp => emp.id === employeeId || emp.employee_id === employeeId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
      </div>
    );
  }

  if (sortedEntries.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No time entries found</div>;
  }

  if (viewMode === 'field') {
    return (
      <div className="space-y-3">
        {sortedEntries.map(entry => {
          const employee = getEmployeeById(entry.employee_id);

          return (
            <Card key={entry.id} className="shadow-sm">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center text-xs text-muted-foreground">
                    {entry.entity_type === 'project' ? (
                      <Building className="h-3 w-3 mr-1.5" />
                    ) : (
                      <Briefcase className="h-3 w-3 mr-1.5" />
                    )}
                    <span>{entry.entity_name || 'Unknown Entity'}</span>
                  </div>
                  <div className="flex-shrink-0">
                    {entry.has_receipts && <Receipt className="h-4 w-4 text-green-500" />}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center text-sm mb-0.5">
                      <User className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span className="font-medium">
                        {employee ? getEmployeeFullName(employee) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1.5" />
                      <span>{formatDate(entry.date_worked)}</span>
                      <span className="mx-1">|</span>
                      <span>
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-base">{entry.hours_worked.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground"> hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {showDate && <TableHead>Date</TableHead>}
            <TableHead>Employee</TableHead>
            <TableHead>Project / Work Order</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Hours</TableHead>
            {viewMode === 'admin' && (
              <>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">Total Billable</TableHead>
              </>
            )}
            {viewMode === 'admin' && <TableHead>Notes</TableHead>}
            {viewMode === 'admin' && <TableHead>Receipts</TableHead>}
            {viewMode === 'admin' && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map(entry => {
            const employee = getEmployeeById(entry.employee_id);
            const fullEntry: TimeEntry = {
              entity_type: 'unknown',
              entity_id: 'unknown',
              ...entry,
            };
            return (
              <TableRow key={fullEntry.id}>
                {showDate && (
                  <TableCell>
                    {
                      // Log the date value before formatting
                      (() => {
                        console.log(
                          `[TimeEntryList] Formatting date: ${entry.date_worked}, Type: ${typeof entry.date_worked}`
                        );
                        return formatDate(entry.date_worked);
                      })()
                    }
                  </TableCell>
                )}
                <TableCell>{employee ? getEmployeeFullName(employee) : 'Unknown'}</TableCell>
                <TableCell>{entry.entity_name || entry.entity_id}</TableCell>
                <TableCell>
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                </TableCell>
                <TableCell>{entry.hours_worked.toFixed(1)}</TableCell>
                {viewMode === 'admin' && (
                  <>
                    <TableCell className="text-right">
                      {entry.total_cost != null ? formatCurrency(entry.total_cost) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.total_billable != null ? formatCurrency(entry.total_billable) : '-'}
                    </TableCell>
                  </>
                )}
                {viewMode === 'admin' && (
                  <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                )}
                {viewMode === 'admin' && (
                  <TableCell>
                    {fullEntry.has_receipts && <Receipt className="h-4 w-4 text-green-600" />}
                  </TableCell>
                )}
                {viewMode === 'admin' && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditEntry(fullEntry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => onDeleteEntry(fullEntry)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Delete/Edit Dialogs should likely be managed by the PARENT component using the hook state */}
    </div>
  );
};

export default TimeEntryList;
export { TimeEntryList };
