
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubcontractorSpecialties = (subcontractorId: string | undefined) => {
  const [specialtyIds, setSpecialtyIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSpecialties = async () => {
      if (!subcontractorId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // First try the new junction table
        const { data: junctionData, error: junctionError } = await supabase
          .from('subcontractor_specialty_junction')
          .select('specialty_id')
          .eq('subcontractor_id', subcontractorId);
        
        if (junctionError) {
          throw junctionError;
        }
        
        if (junctionData && junctionData.length > 0) {
          // Use the normalized structure
          setSpecialtyIds(junctionData.map(item => item.specialty_id));
        } else {
          // Fall back to the old structure with arrays
          const { data: subcontractorData, error: subcontractorError } = await supabase
            .from('subcontractors')
            .select('specialty_ids')
            .eq('subid', subcontractorId)
            .maybeSingle();
          
          if (subcontractorError) {
            throw subcontractorError;
          }
          
          if (subcontractorData && subcontractorData.specialty_ids) {
            setSpecialtyIds(subcontractorData.specialty_ids);
          } else {
            setSpecialtyIds([]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching subcontractor specialties:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialties();
  }, [subcontractorId]);
  
  return { specialtyIds, loading, error };
};

export default useSubcontractorSpecialties;
