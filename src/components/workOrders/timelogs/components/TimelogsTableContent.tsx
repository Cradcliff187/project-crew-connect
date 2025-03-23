
import { Table } from '@/components/ui/table';
import { TimeEntry } from '@/types/timeTracking';
import { TimelogsTableHeader, TimelogsTableBody } from './table';
import { Card, CardContent } from '@/components/ui/card';

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

  return (
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
  );
};

export default TimelogsTableContent;
