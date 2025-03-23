
import { Table } from '@/components/ui/table';
import { TimeEntry } from '@/types/timeTracking';
import { TimelogsTableHeader, TimelogsTableBody, EmptyState } from './table';

interface TimelogsTableContentProps {
  timelogs: TimeEntry[];
  loading?: boolean;
  employeeNameFn: (employeeId: string | null) => string;
  onDelete: (id: string) => Promise<void>;
}

const TimelogsTableContent = ({
  timelogs,
  loading = false,
  employeeNameFn,
  onDelete
}: TimelogsTableContentProps) => {
  // Calculate total hours
  const totalHours = timelogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Loading time logs...</p>
      </div>
    );
  }

  if (!timelogs || timelogs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TimelogsTableHeader />
        <TimelogsTableBody 
          timelogs={timelogs} 
          employeeNameFn={employeeNameFn} 
          onDelete={onDelete} 
        />
      </Table>
    </div>
  );
};

export default TimelogsTableContent;
