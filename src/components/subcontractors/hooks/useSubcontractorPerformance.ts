
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubcontractorPerformance = (subcontractorId: string | undefined) => {
  const [performance, setPerformance] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPerformance = async () => {
      if (!subcontractorId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching performance data for subcontractor:', subcontractorId);
        
        // Use the consolidated table
        const { data, error } = await supabase
          .from('subcontractors_new')
          .select(`
            rating, 
            on_time_percentage, 
            quality_score, 
            safety_incidents, 
            response_time_hours
          `)
          .eq('subid', subcontractorId)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        console.log('Received performance data:', data);
        setPerformance(data);
      } catch (error: any) {
        console.error('Error fetching subcontractor performance:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformance();
  }, [subcontractorId]);
  
  return { performance, loading, error };
};

export default useSubcontractorPerformance;
