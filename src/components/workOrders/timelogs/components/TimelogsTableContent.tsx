
import { Table } from '@/components/ui/table';
import { TimeEntry } from '@/types/timeTracking';
import { TimelogsTableHeader, TimelogsTableBody, EmptyState } from './table';
import { Card, CardContent } from '@/components/ui/card';
import TotalHoursDisplay from './TotalHoursDisplay';

interface TimelogsTableContentProps {
  timelogs: TimeEntry[];
  employees: { employee_id: string; name: string }[];
  onDelete: (id: string) => Promise<void>;
}

const TimelogsTableContent = ({
  timelogs,
  employees,
  onDelete
}: TimelogsTableContentProps) => {
  // Find employee name by ID
  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Unassigned';
    const employee = employees.find(e => e.employee_id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Calculate total hours
  const totalHours = timelogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);

  if (!timelogs || timelogs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-[#0485ea]/10">
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TimelogsTableHeader />
              <TimelogsTableBody 
                timelogs={timelogs} 
                employeeNameFn={getEmployeeName} 
                onDelete={onDelete} 
              />
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Hours Display */}
      <TotalHoursDisplay totalHours={totalHours} />
    </div>
  );
};

export default TimelogsTableContent;
