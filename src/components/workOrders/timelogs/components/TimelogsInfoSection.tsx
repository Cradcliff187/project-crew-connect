
import { useState, useEffect } from 'react';
import { WorkOrderTimelog } from '@/types/workOrder';
import { TimelogsTableContent } from '../components';
import { TimelogSectionHeader, TimelogAddSheet } from './header';
import { EmptyState } from './table';
import TotalHoursDisplay from './TotalHoursDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface TimelogsInfoSectionProps {
  timelogs: WorkOrderTimelog[];
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
  onTimeLogAdded
}: TimelogsInfoSectionProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  // Calculate total hours whenever timelogs change
  useEffect(() => {
    const total = timelogs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
    setTotalHours(total);
  }, [timelogs]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <TimelogSectionHeader onAddClick={() => setShowAddForm(true)} />
      
      {/* Timelogs Table or Empty State */}
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          <TimelogsTableContent
            timelogs={timelogs}
            employees={employees}
            onDelete={onDelete}
          />
          
          {/* Display total hours if there are timelogs */}
          {timelogs.length > 0 && (
            <TotalHoursDisplay totalHours={totalHours} />
          )}
        </>
      )}
      
      {/* Add Timelog Sheet */}
      <TimelogAddSheet
        open={showAddForm}
        onOpenChange={setShowAddForm}
        workOrderId={workOrderId}
        employees={employees}
        onSuccess={() => {
          onTimeLogAdded();
          setShowAddForm(false);
        }}
      />
    </div>
  );
};

export default TimelogsInfoSection;
