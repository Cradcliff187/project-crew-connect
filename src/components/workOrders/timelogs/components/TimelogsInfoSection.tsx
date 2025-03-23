
import { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { Card, CardContent } from '@/components/ui/card';
import { TimelogSectionHeader } from './header';
import TimelogsTableContent from './TimelogsTableContent';
import TimelogAddSheet from './header/TimelogAddSheet';
import TotalHoursDisplay from './TotalHoursDisplay';

interface TimelogsInfoSectionProps {
  timelogs: TimeEntry[];
  loading: boolean;
  employees: { id: string; name: string }[];
  workOrderId: string;
  onDelete: (id: string) => Promise<void>;
  onTimeLogAdded: () => void;
}

const TimelogsInfoSection = ({
  timelogs,
  loading,
  employees,
  workOrderId,
  onDelete,
  onTimeLogAdded,
}: TimelogsInfoSectionProps) => {
  const [showAddSheet, setShowAddSheet] = useState(false);
  
  // Calculate total hours
  const totalHours = timelogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
  
  // Find employee name by ID
  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find(e => e.id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  return (
    <div className="space-y-4">
      <TimelogSectionHeader 
        onAddClick={() => setShowAddSheet(true)}
      />
      
      <Card className="shadow-sm border-[#0485ea]/10">
        <CardContent className="p-0">
          <TimelogsTableContent
            timelogs={timelogs}
            loading={loading}
            employeeNameFn={getEmployeeName}
            onDelete={onDelete}
          />
          
          {timelogs.length > 0 ? (
            <div className="flex justify-between items-center bg-gray-50 p-4 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Total Entries: {timelogs.length}</span>
              </div>
              <TotalHoursDisplay totalHours={totalHours} />
            </div>
          ) : null}
        </CardContent>
      </Card>
      
      <TimelogAddSheet
        workOrderId={workOrderId}
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        onSuccess={onTimeLogAdded}
        employees={employees}
      />
    </div>
  );
};

export default TimelogsInfoSection;
