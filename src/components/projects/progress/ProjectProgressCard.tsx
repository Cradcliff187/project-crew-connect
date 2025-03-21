
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useProjectProgress } from './hooks/useProjectProgress';
import ProgressDisplay from './ProgressDisplay';

interface ProjectProgressCardProps {
  projectId: string;
  title?: string;
  className?: string;
}

const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({ 
  projectId, 
  title = "Project Progress", 
  className = ""
}) => {
  const { progressValue, loading, error } = useProjectProgress(projectId);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse h-4 w-full bg-gray-200 rounded" />
        ) : error ? (
          <p className="text-sm text-red-500">Error loading progress</p>
        ) : (
          <ProgressDisplay progressValue={progressValue} />
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectProgressCard;
