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
import { Edit, Trash, Receipt } from 'lucide-react';
import TimeEntryDeleteDialog from './TimeEntryDeleteDialog';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import { useTimeEntryOperations } from './hooks/useTimeEntryOperations';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/types/common';
import { getEmployeeFullName } from '@/utils/employeeAdapter';
import { TimeEntry } from '@/types/timeTracking';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  employees: Employee[];
  showDate?: boolean;
  onEntryChange?: () => void;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  employees,
  showDate = true,
  onEntryChange,
}) => {
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    entryToDelete,
    startDelete,
    confirmDelete,
    isDeleting,
    showEditDialog,
    setShowEditDialog,
    entryToEdit,
    startEdit,
    saveEdit,
    isSaving,
  } = useTimeEntryOperations(onEntryChange);

  const sortedEntries = [...timeEntries].sort(
    (a, b) => new Date(b.date_worked).getTime() - new Date(a.date_worked).getTime()
  );

  const getEmployeeById = (employeeId: string): Employee | undefined => {
    if (!employeeId) return undefined;
    return employees.find(emp => emp.id === employeeId || emp.employee_id === employeeId);
  };

  if (sortedEntries.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No time entries found</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {showDate && <TableHead>Date</TableHead>}
            <TableHead>Employee</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Receipts</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
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
                {showDate && <TableCell>{formatDate(entry.date_worked)}</TableCell>}
                <TableCell>{employee ? getEmployeeFullName(employee) : 'Unknown'}</TableCell>
                <TableCell>
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                </TableCell>
                <TableCell>{entry.hours_worked.toFixed(1)}</TableCell>
                <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                <TableCell>
                  {fullEntry.has_receipts && <Receipt className="h-4 w-4 text-green-600" />}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => startEdit(fullEntry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => startDelete(fullEntry)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TimeEntryDeleteDialog
        timeEntry={entryToDelete as TimeEntry}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <TimeEntryEditDialog
        timeEntry={entryToEdit as TimeEntry}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={saveEdit}
        isSaving={isSaving}
      />
    </div>
  );
};

export default TimeEntryList;
export { TimeEntryList };
