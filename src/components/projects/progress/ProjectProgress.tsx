
import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectProgress } from './hooks/useProjectProgress';
import ProgressDisplay from './ProgressDisplay';
import ProgressEditForm from './ProgressEditForm';
import { toast } from '@/hooks/use-toast';

interface ProjectProgressProps {
  projectId: string;
}

const ProjectProgress = ({ projectId }: ProjectProgressProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    loading,
    error,
    progressData,
    progressValue,
    setProgressValue,
    saveProgress,
    fetchProgress
  } = useProjectProgress(projectId);
  
  const handleSaveProgress = async () => {
    const success = await saveProgress(progressValue);
    if (success) {
      toast({
        title: 'Progress Updated',
        description: `Project progress has been updated to ${progressValue}%.`
      });
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Reset to original value by re-fetching from server
    fetchProgress();
    setIsEditing(false);
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500 mb-2">Error loading progress data</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchProgress()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Progress</CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Update
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSaveProgress} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <ProgressDisplay progressValue={progressValue} />
          
          {isEditing && (
            <div className="mt-4">
              <ProgressEditForm 
                onProgressChange={setProgressValue}
                progressValue={progressValue}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectProgress;
