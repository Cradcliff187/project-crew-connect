
import { useCallback } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { mapStatusToStatusBadge } from '../ProjectsTable';
import { ProjectDetails } from '../ProjectDetails';
import { useStatusTransitions } from './hooks/useStatusTransitions';
import { useStatusUpdate } from './hooks/useStatusUpdate';
import StatusDropdownMenu from './StatusDropdownMenu';
import NoStatusOptions from './NoStatusOptions';

interface ProjectStatusControlProps {
  project: ProjectDetails;
  onStatusChange: () => void;
}

const ProjectStatusControl = ({ project, onStatusChange }: ProjectStatusControlProps) => {
  const { availableStatuses, refreshTransitions } = useStatusTransitions({
    currentStatus: project.status
  });
  
  const { updating, updateStatus } = useStatusUpdate({
    projectId: project.projectid,
    currentStatus: project.status,
    onStatusChange,
    refreshTransitions
  });
  
  const handleStatusChange = useCallback((newStatus: string) => {
    updateStatus(newStatus);
  }, [updateStatus]);
  
  return (
    <div className="flex items-center gap-2">
      <StatusBadge status={mapStatusToStatusBadge(project.status)} />
      
      {availableStatuses.length > 0 ? (
        <StatusDropdownMenu 
          availableStatuses={availableStatuses}
          updating={updating}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <NoStatusOptions />
      )}
    </div>
  );
};

export default ProjectStatusControl;
