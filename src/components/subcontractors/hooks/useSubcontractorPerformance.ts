
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
        
        // Try the new table first
        const { data: performanceData, error: performanceError } = await supabase
          .from('subcontractor_performance')
          .select('*')
          .eq('subcontractor_id', subcontractorId)
          .maybeSingle();
        
        if (performanceError) {
          throw performanceError;
        }
        
        if (performanceData) {
          setPerformance(performanceData);
        } else {
          // Fall back to the old table structure for backward compatibility
          const { data: subcontractorData, error: subcontractorError } = await supabase
            .from('subcontractors')
            .select('rating, on_time_percentage, quality_score, safety_incidents, response_time_hours')
            .eq('subid', subcontractorId)
            .maybeSingle();
          
          if (subcontractorError) {
            throw subcontractorError;
          }
          
          setPerformance(subcontractorData);
        }
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
