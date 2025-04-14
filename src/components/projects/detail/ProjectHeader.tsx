import React from 'react';
import { ProjectDetails } from '../ProjectDetails';

interface ProjectHeaderProps {
  project: ProjectDetails;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold">{project.projectname}</h3>
      <p className="text-sm text-muted-foreground">Project ID: {project.projectid}</p>
    </div>
  );
};

export default ProjectHeader;
