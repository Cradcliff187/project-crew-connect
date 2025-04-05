
import React from 'react';
import { useParams } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';

const ProjectDetail = () => {
  const { projectId } = useParams();
  
  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Project Details</h1>
        <p>Project ID: {projectId}</p>
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
