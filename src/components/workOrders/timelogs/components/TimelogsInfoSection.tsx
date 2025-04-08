
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { formatDate, formatHours, formatCurrency } from "@/lib/utils";
import { TimelogAddHeader } from "./header";

interface TimelogsInfoSectionProps {
  timelogs: any[];
  loading: boolean;
  employees: { employee_id: string; name: string }[];
  workOrderId: string;
  onDelete: (id: string) => void;
  onTimeLogAdded: () => void;
  totalHours: number;
  totalLaborCost: number;
}

export const TimelogsInfoSection = ({
  timelogs,
  loading,
  employees,
  workOrderId,
  onDelete,
  onTimeLogAdded,
  totalHours,
  totalLaborCost,
}: TimelogsInfoSectionProps) => {
  return (
    <Card>
      <TimelogAddHeader
        workOrderId={workOrderId}
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
            No time entries recorded for this work order yet.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="rounded-md bg-muted p-3">
                <div className="text-sm text-muted-foreground">Total Hours</div>
                <div className="text-lg font-semibold">
                  {formatHours(totalHours)}
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="text-sm text-muted-foreground">
                  Total Labor Cost
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(totalLaborCost)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {timelogs.map((timelog) => (
                <div
                  key={timelog.id}
                  className="flex justify-between items-center border-b pb-2 last:border-0"
                >
                  <div>
                    <div className="font-medium">
                      {timelog.employee_name || "Unassigned"} •{" "}
                      {formatHours(timelog.hours_worked)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(timelog.date_worked)} •{" "}
                      {timelog.start_time?.substring(0, 5)} -{" "}
                      {timelog.end_time?.substring(0, 5)}
                    </div>
                    {timelog.notes && (
                      <div className="text-sm mt-1">{timelog.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(timelog.total_cost)}
                      </div>
                      {timelog.employee_rate && (
                        <div className="text-xs text-muted-foreground">
                          @{formatCurrency(timelog.employee_rate)}/hr
                        </div>
                      )}
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
