
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Employee } from '@/types/common';
import { getEmployeeFullName } from '@/utils/employeeAdapter';

interface TimeEntry {
  id: string;
  date_worked: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  notes?: string;
  employee_id: string;
  has_receipts: boolean;
  created_at: string;
}

type TimeEntryListProps = {
  timeEntries: TimeEntry[];
  employees: Employee[];
  showDate?: boolean;
};

const TimeEntryList: React.FC<TimeEntryListProps> = ({
  timeEntries,
  employees,
  showDate = true,
}) => {
  const sortedEntries = [...timeEntries].sort(
    (a, b) => new Date(b.date_worked).getTime() - new Date(a.date_worked).getTime()
  );

  const getEmployeeById = (employeeId: string): Employee | undefined => {
    if (!employeeId) return undefined;
    return employees.find(emp => emp.id === employeeId || emp.employee_id === employeeId);
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No time entries found
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {showDate && <TableHead>Date</TableHead>}
              <TableHead>Employee</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Receipts</TableHead>
            </TableHeader>
            <TableBody>
              {sortedEntries.map((entry) => {
                const employee = getEmployeeById(entry.employee_id);
                
                return (
                  <TableRow key={entry.id}>
                    {showDate && (
                      <TableCell>{format(new Date(entry.date_worked), 'MMM d, yyyy')}</TableCell>
                    )}
                    <TableCell>
                      {employee ? getEmployeeFullName(employee) : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {entry.start_time} - {entry.end_time}
                    </TableCell>
                    <TableCell>{entry.hours_worked}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{entry.notes || ''}</TableCell>
                    <TableCell>
                      {entry.has_receipts && (
                        <Receipt className="h-4 w-4 text-green-600" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// Export both as default and named export for compatibility
export default TimeEntryList;
export { TimeEntryList };
