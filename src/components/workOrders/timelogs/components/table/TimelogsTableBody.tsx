
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';
import { EmptyState } from './';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import { Clock, Trash2 } from 'lucide-react';

interface TimelogsTableBodyProps {
  timelogs: TimeEntry[];
  employeeNameFn: (employeeId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
}

const TimelogsTableBody = ({ timelogs, employeeNameFn, onDelete }: TimelogsTableBodyProps) => {
  if (!timelogs || timelogs.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <TableBody>
      {timelogs.map((log) => {
        const actionGroups: ActionGroup[] = [
          {
            items: [
              {
                label: "View Details",
                icon: <Clock className="h-4 w-4" />,
                onClick: () => console.log("View time log details:", log.id),
                className: "text-[#0485ea] hover:text-[#0375d1]"
              }
            ]
          },
          {
            items: [
              {
                label: "Delete",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDelete(log.id),
                className: "text-red-500 hover:text-red-700"
              }
            ]
          }
        ];

        return (
          <TableRow key={log.id} className="hover:bg-[#0485ea]/5 transition-colors">
            <TableCell>{formatDate(log.date_worked)}</TableCell>
            <TableCell>{employeeNameFn(log.employee_id)}</TableCell>
            <TableCell className="font-medium">{log.hours_worked}</TableCell>
            <TableCell className="max-w-[200px] truncate">{log.notes || '-'}</TableCell>
            <TableCell className="text-right">
              <ActionMenu 
                groups={actionGroups}
                size="sm" 
                align="end"
                triggerClassName="ml-auto"
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default TimelogsTableBody;
