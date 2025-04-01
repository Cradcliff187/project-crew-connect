
import { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { Card, CardContent } from '@/components/ui/card';
import { TimelogSectionHeader } from './header';
import TimelogsTableContent from './TimelogsTableContent';
import TimelogAddSheet from './header/TimelogAddSheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, Info } from 'lucide-react';

interface TimelogsInfoSectionProps {
  timelogs: TimeEntry[];
  loading: boolean;
  employees: { employee_id: string; name: string }[];
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
  const getEmployeeName = (employeeId: string | null | undefined) => {
    if (!employeeId) return "Unassigned";
    const employee = employees.find(e => e.employee_id === employeeId);
    return employee ? employee.name : "Unknown Employee";
  };
  
  return (
    <div className="space-y-4">
      <TimelogSectionHeader 
        onAddClick={() => setShowAddSheet(true)}
      />
      
      {timelogs.length === 0 && !loading && (
        <Alert className="bg-[#0485ea]/5 border-[#0485ea]/20">
          <Info className="h-4 w-4 text-[#0485ea]" />
          <AlertTitle>No time entries yet</AlertTitle>
          <AlertDescription>
            Click "Add Time Entry" to log time spent on this work order. Time entries will automatically update the labor cost.
          </AlertDescription>
        </Alert>
      )}
      
      {(timelogs.length > 0 || loading) && (
        <Card className="shadow-sm border-[#0485ea]/10">
          <CardContent className="p-0">
            <TimelogsTableContent
              timelogs={timelogs}
              loading={loading}
              employeeNameFn={getEmployeeName}
              onDelete={onDelete}
            />
            
            {timelogs.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-4 border-t gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={18} />
                  <span className="font-medium">Total Entries: {timelogs.length}</span>
                </div>
                <div className="bg-[#0485ea]/10 px-4 py-2 rounded-md flex items-center gap-2 w-full md:w-auto">
                  <span className="text-sm font-medium text-gray-700">Total Hours:</span>
                  <span className="text-lg font-bold text-[#0485ea]">{totalHours.toFixed(1)} hrs</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
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
