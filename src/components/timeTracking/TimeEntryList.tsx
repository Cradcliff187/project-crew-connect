import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/timeTracking';
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
import { Edit, Trash } from 'lucide-react';
import TimeEntryDeleteDialog from './TimeEntryDeleteDialog';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import { useTimeEntryOperations } from './hooks/useTimeEntryOperations';
import { supabase } from '@/integrations/supabase/client';
import { Employee, getEmployeeFullName } from '@/types/common';

interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  entries,
  isLoading,
  onEntryChange,
  isMobile = false,
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
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: Employee }>({});

  // Fetch employee data using the standardized Employee interface
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('employee_id, first_name, last_name, role, hourly_rate, status');

        if (error) {
          console.error('Error fetching employees:', error);
          return;
        }

        if (data) {
          // Store complete employee objects by ID
          const employeeNameMap = data.reduce(
            (acc, emp) => {
              acc[emp.employee_id] = emp;
              return acc;
            },
            {} as { [key: string]: Employee }
          );
          setEmployeeMap(employeeNameMap);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, []);

  // Use the standardized helper function to get employee names
  const getEmployeeName = (employeeId: string | undefined | null): string => {
    if (!employeeId) return 'Unassigned';
    const employee = employeeMap[employeeId];
    return employee ? getEmployeeFullName(employee) : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0485ea]"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No time entries found for this period.</p>
        <p className="text-sm mt-2">Click "Add Entry" to log your time.</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{formatDate(entry.date_worked)}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{entry.hours_worked.toFixed(1)} hrs</div>
                <div className="text-sm text-gray-600">{getEmployeeName(entry.employee_id)}</div>
              </div>
            </div>

            {entry.notes && <div className="mt-2 text-sm border-t pt-2">{entry.notes}</div>}

            <div className="mt-3 flex justify-end space-x-2">
              <Button variant="outline" size="sm" className="h-8" onClick={() => startEdit(entry)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-red-500 hover:text-red-700"
                onClick={() => startDelete(entry)}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <TimeEntryDeleteDialog
          timeEntry={entryToDelete}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />

        <TimeEntryEditDialog
          timeEntry={entryToEdit}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={saveEdit}
          isSaving={isSaving}
        />
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map(entry => (
            <TableRow key={entry.id}>
              <TableCell>{formatDate(entry.date_worked)}</TableCell>
              <TableCell>
                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
              </TableCell>
              <TableCell>{entry.hours_worked.toFixed(1)}</TableCell>
              <TableCell>{getEmployeeName(entry.employee_id)}</TableCell>
              <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(entry)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => startDelete(entry)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TimeEntryDeleteDialog
        timeEntry={entryToDelete}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <TimeEntryEditDialog
        timeEntry={entryToEdit}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={saveEdit}
        isSaving={isSaving}
      />
    </div>
  );
};
