
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { WorkOrderTimelog } from '@/types/workOrder';

interface TimelogsTableBodyProps {
  timelogs: WorkOrderTimelog[];
  employeeNameFn: (employeeId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
}

const TimelogsTableBody = ({ timelogs, employeeNameFn, onDelete }: TimelogsTableBodyProps) => {
  return (
    <TableBody>
      {timelogs.map((log) => (
        <TableRow key={log.id}>
          <TableCell>{formatDate(log.work_date)}</TableCell>
          <TableCell>{employeeNameFn(log.employee_id)}</TableCell>
          <TableCell>{log.hours_worked}</TableCell>
          <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
          <TableCell className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(log.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default TimelogsTableBody;
