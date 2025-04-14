import { useCallback } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { ProjectDetails } from '../ProjectDetails';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import UniversalStatusControl from '@/components/common/status/UniversalStatusControl';

interface ProjectStatusControlProps {
  project: ProjectDetails;
  onStatusChange: () => void;
}

const ProjectStatusControl = ({ project, onStatusChange }: ProjectStatusControlProps) => {
  const { statusOptions } = useStatusOptions('PROJECT', project.status);

  return (
    <div className="flex items-center gap-2">
      <UniversalStatusControl
        entityId={project.projectid}
        entityType="PROJECT"
        currentStatus={project.status}
        statusOptions={statusOptions}
        tableName="projects"
        idField="projectid"
        onStatusChange={onStatusChange}
        showStatusBadge={true}
      />
    </div>
  );
};

export default ProjectStatusControl;
