
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';
import { EmptyState } from './';

interface TimelogsTableBodyProps {
  timelogs: TimeEntry[];
  employeeNameFn: (employeeId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
}

const TimelogsTableBody = ({ timelogs, employeeNameFn, onDelete }: TimelogsTableBodyProps) => {
  console.log('Rendering TimelogsTableBody with logs:', timelogs);
  
  if (!timelogs || timelogs.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <TableBody>
      {timelogs.map((log) => (
        <TableRow key={log.id} className="hover:bg-[#0485ea]/5 transition-colors">
          <TableCell>{formatDate(log.date_worked)}</TableCell>
          <TableCell>{employeeNameFn(log.employee_id)}</TableCell>
          <TableCell className="font-medium">{log.hours_worked}</TableCell>
          <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
          <TableCell className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(log.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
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
