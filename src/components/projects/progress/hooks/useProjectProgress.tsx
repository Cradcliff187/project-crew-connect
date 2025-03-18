
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProgressData {
  id: string;
  projectid: string;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export const useProjectProgress = (projectId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  
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
  
  const saveProgress = async (newProgressValue: number) => {
    try {
      if (progressData) {
        // Update existing progress
        const { error } = await supabase
          .from('project_progress')
          .update({ progress_percentage: newProgressValue })
          .eq('id', progressData.id);
          
        if (error) throw error;
      } else {
        // Create new progress
        const { error } = await supabase
          .from('project_progress')
          .insert({
            projectid: projectId,
            progress_percentage: newProgressValue
          });
          
        if (error) throw error;
      }
      
      setProgressData({
        ...progressData,
        progress_percentage: newProgressValue,
        updated_at: new Date().toISOString()
      } as ProgressData);
      
      toast({
        title: 'Progress updated',
        description: `Project progress has been updated to ${newProgressValue}%.`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating progress',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };
  
  useEffect(() => {
    fetchProgress();
  }, [projectId]);
  
  return {
    loading,
    error,
    progressData,
    progressValue,
    setProgressValue,
    saveProgress,
    fetchProgress
  };
};
