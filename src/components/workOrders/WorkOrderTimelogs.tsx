import { useWorkOrderTimelogs } from './hooks/useWorkOrderTimelogs';
import { TimelogsInfoSection } from './timelogs/components';

interface WorkOrderTimelogsProps {
  workOrderId: string;
  onTimeLogAdded?: () => void;
}

const WorkOrderTimelogs = ({ workOrderId, onTimeLogAdded }: WorkOrderTimelogsProps) => {
  const {
    timelogs,
    loading,
    employees,
    totalHours,
    totalLaborCost,
    fetchTimelogs,
    handleDeleteTimelog,
  } = useWorkOrderTimelogs(workOrderId);

  // Refresh data after adding a new time log
  const handleSuccessfulAdd = () => {
    fetchTimelogs();
    if (onTimeLogAdded) onTimeLogAdded();
  };

  return (
    <TimelogsInfoSection
      timelogs={timelogs}
      loading={loading}
      employees={employees}
      workOrderId={workOrderId}
      onDelete={handleDeleteTimelog}
      onTimeLogAdded={handleSuccessfulAdd}
      totalHours={totalHours}
      totalLaborCost={totalLaborCost}
    />
  );
};

export default WorkOrderTimelogs;
