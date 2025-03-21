
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseProjectProgressResult {
  progressValue: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useProjectProgress = (projectId: string): UseProjectProgressResult => {
  const [progressValue, setProgressValue] = useState<number>(0);
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
        .select('progress_percentage')
        .eq('projectid', projectId)
        .single();
      
      if (error) {
        // If no record found, just set progress to 0
        if (error.code === 'PGRST116') {
          setProgressValue(0);
        } else {
          throw error;
        }
      } else if (data) {
        setProgressValue(data.progress_percentage || 0);
      } else {
        setProgressValue(0);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching project progress:', err);
      setError(err.message || 'Error fetching progress');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProgress();
  }, [projectId]);
  
  return { progressValue, loading, error, refetch: fetchProgress };
};
