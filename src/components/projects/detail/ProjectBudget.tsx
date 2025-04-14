import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectBudgetProps {
  projectId: string;
}

const ProjectBudget: React.FC<ProjectBudgetProps> = ({ projectId }) => {
  // This is a placeholder. In the future, this could be expanded with actual budget functionality
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <h3 className="text-lg font-medium mb-4">Project Budget</h3>
      <p className="text-sm text-muted-foreground mb-6">
        This feature is currently in development. Budget details will be available soon.
      </p>
    </div>
  );
};

export default ProjectBudget;
