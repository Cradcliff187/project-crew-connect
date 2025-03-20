
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
        console.log('Fetching specialties for subcontractor:', subcontractorId);
        
        // Use the consolidated table
        const { data, error } = await supabase
          .from('subcontractors_new')
          .select('specialty_ids')
          .eq('subid', subcontractorId)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        console.log('Received specialty data:', data);
        
        if (data && data.specialty_ids) {
          // Convert any UUIDs to strings to ensure type compatibility
          const convertedIds = Array.isArray(data.specialty_ids) 
            ? data.specialty_ids.map(id => String(id)) 
            : [];
          
          console.log('Converted specialty IDs:', convertedIds);
          setSpecialtyIds(convertedIds);
        } else {
          setSpecialtyIds([]);
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
