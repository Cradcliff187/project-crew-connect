
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';
import { useProjectProgress } from './hooks/useProjectProgress';
import ProgressDisplay from './ProgressDisplay';
import ProgressEditForm from './ProgressEditForm';

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
  const [isEditing, setIsEditing] = useState(false);
  const { progressValue, loading, error, refetch } = useProjectProgress(projectId);
  
  const handleProgressUpdate = () => {
    refetch();
    setIsEditing(false);
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {!isEditing && !loading && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse h-4 w-full bg-gray-200 rounded" />
        ) : error ? (
          <p className="text-sm text-red-500">Error loading progress</p>
        ) : isEditing ? (
          <ProgressEditForm 
            projectId={projectId}
            currentProgress={progressValue}
            onProgressUpdate={handleProgressUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProgressDisplay progressValue={progressValue} />
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectProgressCard;
