import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Clock, Trash2, Edit } from 'lucide-react';

interface TimelogsTableBodyProps {
  timelogs: TimeEntry[];
  employeeNameFn: (employeeId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
  onEdit: (log: TimeEntry) => void;
  employees: { employee_id: string; name: string }[];
}

const TimelogsTableBody = ({
  timelogs,
  employeeNameFn,
  onDelete,
  onEdit,
  employees,
}: TimelogsTableBodyProps) => {
  // The parent components will handle empty states, so we'll just render the rows here
  return (
    <TableBody>
      {timelogs.map(log => {
        const employee = employees.find(e => e.employee_id === log.employee_id);
        const actionGroups: ActionGroup[] = [
          {
            items: [
              {
                label: 'View Details',
                icon: <Clock className="h-4 w-4" />,
                onClick: () => console.log('View time log details:', log.id),
                className: 'text-[#0485ea] hover:text-[#0375d1]',
              },
              {
                label: 'Edit Entry',
                icon: <Edit className="h-4 w-4" />,
                onClick: () => onEdit(log),
                className: 'text-primary hover:text-primary/80',
              },
            ],
          },
          {
            items: [
              {
                label: 'Delete',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDelete(log.id),
                className: 'text-red-500 hover:text-red-700',
              },
            ],
          },
        ];

        return (
          <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
            <TableCell>{formatDate(log.date_worked)}</TableCell>
            <TableCell>{employeeNameFn(log.employee_id)}</TableCell>
            <TableCell className="font-medium">{log.hours_worked}</TableCell>
            <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
            <TableCell className="text-right">
              <ActionMenu groups={actionGroups} size="sm" align="end" triggerClassName="ml-auto" />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default TimelogsTableBody;
