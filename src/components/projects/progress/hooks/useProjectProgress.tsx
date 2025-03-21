
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProjectProgressResult {
  progressValue: number;
  progressData: any;
  loading: boolean;
  error: string | null;
  fetchProgress: () => Promise<void>;
  setProgressValue: (value: number) => void;
  saveProgress: (value: number) => Promise<boolean>;
}

export const useProjectProgress = (projectId: string): UseProjectProgressResult => {
  const [progressValue, setProgressValue] = useState<number>(0);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProgress = async () => {
    if (!projectId) {
      setError('No project ID provided');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_progress')
        .select('*')
        .eq('projectid', projectId)
        .maybeSingle();
      
      if (error) {
        // If no record found, just set progress to 0
        if (error.code === 'PGRST116') {
          setProgressValue(0);
          setProgressData(null);
        } else {
          throw error;
        }
      } else if (data) {
        setProgressValue(data.progress_percentage || 0);
        setProgressData(data);
      } else {
        setProgressValue(0);
        setProgressData(null);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching project progress:', err);
      setError(err.message || 'Error fetching progress');
    } finally {
      setLoading(false);
    }
  };
  
  const saveProgress = async (value: number): Promise<boolean> => {
    try {
      // Check if a progress record exists
      const { data, error: checkError } = await supabase
        .from('project_progress')
        .select('id')
        .eq('projectid', projectId)
        .maybeSingle();
      
      let result;
      
      if (data) {
        // Update existing record
        result = await supabase
          .from('project_progress')
          .update({ progress_percentage: value })
          .eq('projectid', projectId);
      } else {
        // Insert new record
        result = await supabase
          .from('project_progress')
          .insert({ projectid: projectId, progress_percentage: value });
      }
      
      if (result.error) throw result.error;
      
      // Update the local state
      setProgressValue(value);
      return true;
    } catch (err: any) {
      console.error('Error saving project progress:', err);
      setError(err.message || 'Error saving progress');
      return false;
    }
  };
  
  useEffect(() => {
    fetchProgress();
  }, [projectId]);
  
  return { 
    progressValue, 
    progressData,
    loading, 
    error, 
    fetchProgress, 
    setProgressValue,
    saveProgress
  };
};
