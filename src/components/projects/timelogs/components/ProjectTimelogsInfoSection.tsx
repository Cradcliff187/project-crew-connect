
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';
import { DataTable } from '@/components/ui/data-table';
import { timelogColumns } from '@/components/workOrders/timelogs/data/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectTimelogAddHeader } from './ProjectTimelogAddHeader';

interface ProjectTimelogsInfoSectionProps {
  timelogs: TimeEntry[];
  loading: boolean;
  employees: { employee_id: string; name: string }[];
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
  totalLaborCost
}: ProjectTimelogsInfoSectionProps) => {
  // Find employee name by ID
  const getEmployeeName = (employeeId: string | null | undefined) => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find(e => e.employee_id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  // Format data for the table - always calculate cost based on hours * rate
  const formattedTimelogs = timelogs.map(log => {
    const hourlyRate = log.employee_rate || 75; // Default to $75/hour if no rate
    const calculatedCost = log.hours_worked * hourlyRate;
    
    return {
      id: log.id,
      date: log.date_worked ? new Date(log.date_worked).toLocaleDateString() : 'N/A',
      hours: log.hours_worked?.toFixed(2) || '0',
      employee: getEmployeeName(log.employee_id),
      notes: log.notes || '',
      date_raw: log.date_worked || '', // For sorting
      total_cost: calculatedCost,
    };
  });
  
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <ProjectTimelogAddHeader 
        projectId={projectId} 
        employees={employees}
        onTimeLogAdded={onTimeLogAdded}
      />
      
      <CardContent>
        {timelogs.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No time entries recorded yet.</p>
            <p className="text-sm mt-2">Log time using the button above.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="bg-[#0485ea]/10 px-4 py-2 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Total Hours
                </p>
                <p className="font-medium text-foreground">
                  {totalHours.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-[#0485ea]/10 px-4 py-2 rounded-md flex items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Labor Cost
                  </p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(totalLaborCost)}
                  </p>
                </div>
              </div>
            </div>
            
            <DataTable
              columns={timelogColumns(onDelete)}
              data={formattedTimelogs}
              filterColumn="employee"
              defaultSorting={{
                columnId: 'date_raw',
                direction: 'desc'
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
