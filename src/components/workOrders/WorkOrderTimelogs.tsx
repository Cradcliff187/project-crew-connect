
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
    fetchTimelogs,
    handleDeleteTimelog
  } = useWorkOrderTimelogs(workOrderId);
  
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
    />
  );
};

export default WorkOrderTimelogs;
