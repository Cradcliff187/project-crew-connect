
import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectDetailRefactored from '@/components/projects/ProjectDetailRefactored';

const ProjectDetail = () => {
  const { projectId } = useParams();
  
  return <ProjectDetailRefactored />;
};

export default ProjectDetail;
