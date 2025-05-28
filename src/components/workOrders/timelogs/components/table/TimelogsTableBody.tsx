import React from 'react';
import { TimeEntry } from '@/types/role-based-types';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { formatTime, formatHoursToDuration } from '@/utils/time/timeUtils';
import { Trash2 } from 'lucide-react';

interface TimelogsTableBodyProps {
  timelogs: TimeEntry[];
  employeeNameFn: (employeeId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
}

export const TimelogsTableBody: React.FC<TimelogsTableBodyProps> = ({
  timelogs,
  employeeNameFn,
  onDelete,
}) => {
  return (
    <TableBody>
      {timelogs.map(timelog => (
        <TableRow key={timelog.id}>
          <TableCell className="font-medium">{employeeNameFn(timelog.employee_id)}</TableCell>
          <TableCell>{formatDate(timelog.date_worked)}</TableCell>
          <TableCell>
            {formatTime(timelog.start_time)} - {formatTime(timelog.end_time)}
          </TableCell>
          <TableCell>{formatHoursToDuration(timelog.hours_worked)}</TableCell>
          <TableCell>{formatCurrency(timelog.employee_rate || 0)}/hr</TableCell>
          <TableCell className="font-medium">{formatCurrency(timelog.total_cost || 0)}</TableCell>
          <TableCell>
            {timelog.notes && (
              <div className="max-w-[200px] truncate" title={timelog.notes}>
                {timelog.notes}
              </div>
            )}
          </TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(timelog.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};
