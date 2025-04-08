
import { useProjectTimelogs } from '../hooks/useProjectTimelogs';
import { TimelogsInfoSection } from '@/components/workOrders/timelogs/components';

interface ProjectTimelogsProps {
  projectId: string;
  onTimeLogAdded?: () => void;
}

const ProjectTimelogs = ({ projectId, onTimeLogAdded }: ProjectTimelogsProps) => {
  const {
    timelogs,
    loading,
    employees,
    totalHours,
    totalLaborCost,
    fetchTimelogs,
    handleDeleteTimelog
  } = useProjectTimelogs(projectId);
  
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
      workOrderId={projectId} // Reusing the prop name, but passing the projectId
      onDelete={handleDeleteTimelog}
      onTimeLogAdded={handleSuccessfulAdd}
      totalHours={totalHours}
      totalLaborCost={totalLaborCost}
    />
  );
};

export default ProjectTimelogs;
