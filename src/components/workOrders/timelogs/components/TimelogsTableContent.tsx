import { TimeEntry } from '@/types/role-based-types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { formatTime, formatHoursToDuration } from '@/utils/time/timeUtils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TimelogsTableContentProps {
  timelogs: TimeEntry[];
  onDelete: (id: string) => void;
}

export const TimelogsTableContent = ({ timelogs, onDelete }: TimelogsTableContentProps) => {
  if (timelogs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No time entries recorded for this work order yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timelogs.map(timelog => (
        <div
          key={timelog.id}
          className="flex justify-between items-center border-b pb-2 last:border-0"
        >
          <div>
            <div className="font-medium">
              {timelog.employee_name || 'Unassigned'} •{' '}
              {formatHoursToDuration(timelog.hours_worked)}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(timelog.date_worked)} • {formatTime(timelog.start_time)} -{' '}
              {formatTime(timelog.end_time)}
            </div>
            {timelog.notes && <div className="text-sm mt-1">{timelog.notes}</div>}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-medium">{formatCurrency(timelog.total_cost || 0)}</div>
              <div className="text-xs text-muted-foreground">
                @{formatCurrency(timelog.employee_rate || 0)}/hr
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(timelog.id)}
              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
