import React from 'react';

interface ProjectDescriptionProps {
  description: string;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({ description }) => {
  return (
    <div>
      <h3 className="text-base font-medium mb-2">Project Description</h3>
      {description ? (
        <p className="text-sm">{description}</p>
      ) : (
        <p className="text-sm text-muted-foreground">No description provided.</p>
      )}
    </div>
  );
};

export default ProjectDescription;
