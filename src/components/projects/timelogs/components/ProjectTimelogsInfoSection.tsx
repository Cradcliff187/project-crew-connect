import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatDate, formatHours, formatCurrency } from '@/lib/utils';
import { ProjectTimelogAddHeader } from './ProjectTimelogAddHeader';
import { Employee } from '@/types/common';

interface ProjectTimelogsInfoSectionProps {
  timelogs: any[];
  loading: boolean;
  employees: Employee[];
  projectId: string;
  onDelete: (id: string) => void;
  onTimeLogAdded: () => void;
  totalHours: number;
  totalLaborCost: number;
}

export const ProjectTimelogsInfoSection = ({
  timelogs,
  loading,
  employees,
  projectId,
  onDelete,
  onTimeLogAdded,
  totalHours,
  totalLaborCost,
}: ProjectTimelogsInfoSectionProps) => {
  return (
    <Card>
      <ProjectTimelogAddHeader
        projectId={projectId}
        employees={employees}
        onTimeLogAdded={onTimeLogAdded}
      />
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
          </div>
        ) : timelogs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No time entries recorded for this project yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="rounded-md bg-muted p-3">
                <div className="text-sm text-muted-foreground">Total Hours</div>
                <div className="text-lg font-semibold">{formatHours(totalHours)}</div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-sm text-muted-foreground">Total Labor Cost</div>
                <div className="text-lg font-semibold">{formatCurrency(totalLaborCost)}</div>
              </div>
            </div>

            <div className="space-y-3">
              {timelogs.map(timelog => (
                <div
                  key={timelog.id}
                  className="flex justify-between items-center border-b pb-2 last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {timelog.employee_name || 'Unassigned'} • {formatHours(timelog.hours_worked)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(timelog.date_worked)} • {timelog.start_time?.substring(0, 5)} -{' '}
                      {timelog.end_time?.substring(0, 5)}
                    </div>
                    {timelog.notes && <div className="text-sm mt-1">{timelog.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(timelog.total_cost)}</div>
                      <div className="text-xs text-muted-foreground">
                        @{formatCurrency(timelog.employee_rate)}/hr
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(timelog.id)}
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
