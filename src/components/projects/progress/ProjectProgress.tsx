
import { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressData {
  id: string;
  projectid: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

interface ProjectProgressProps {
  projectId: string;
}

const ProjectProgress = ({ projectId }: ProjectProgressProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_progress')
          .select('*')
          .eq('projectid', projectId)
          .maybeSingle();
        
        if (error) throw error;
        setProgressData(data as ProgressData);
        setProgressValue(data?.progress_percentage || 0);
      } catch (error: any) {
        console.error('Error fetching project progress:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgress();
  }, [projectId]);
  
  const handleSaveProgress = async () => {
    try {
      if (progressData) {
        // Update existing progress
        const { error } = await supabase
          .from('project_progress')
          .update({ progress_percentage: progressValue })
          .eq('id', progressData.id);
          
        if (error) throw error;
      } else {
        // Create new progress
        const { error } = await supabase
          .from('project_progress')
          .insert({
            projectid: projectId,
            progress_percentage: progressValue
          });
          
        if (error) throw error;
      }
      
      setProgressData({
        ...progressData,
        progress_percentage: progressValue,
        updated_at: new Date().toISOString()
      } as ProgressData);
      
      setIsEditing(false);
      toast({
        title: 'Progress updated',
        description: `Project progress has been updated to ${progressValue}%.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating progress',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleCancelEdit = () => {
    setProgressValue(progressData?.progress_percentage || 0);
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
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
          <div className="flex items-center gap-2 mb-2">
            <Progress value={progressValue} className="h-4" />
            <span className="font-medium">{progressValue}%</span>
          </div>
          
          {isEditing && (
            <div className="mt-4">
              <label className="text-sm font-medium mb-1 block">Update Progress</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-24"
                />
                <span>%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Enter a value between 0 and 100</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectProgress;
