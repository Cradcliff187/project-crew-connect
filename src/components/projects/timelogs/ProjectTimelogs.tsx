import { useProjectTimelogs } from '../hooks/useProjectTimelogs';
import { ProjectTimelogsInfoSection } from './components/ProjectTimelogsInfoSection';

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
    handleDeleteTimelog,
  } = useProjectTimelogs(projectId);

  // Refresh data after adding a new time log
  const handleSuccessfulAdd = () => {
    fetchTimelogs();
    if (onTimeLogAdded) onTimeLogAdded();
  };

  return (
    <ProjectTimelogsInfoSection
      timelogs={timelogs}
      loading={loading}
      employees={employees}
      projectId={projectId}
      onDelete={handleDeleteTimelog}
      onTimeLogAdded={handleSuccessfulAdd}
      totalHours={totalHours}
      totalLaborCost={totalLaborCost}
    />
  );
};

export default ProjectTimelogs;
