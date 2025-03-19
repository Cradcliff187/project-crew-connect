
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Specialty } from '../utils';

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Record<string, Specialty>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subcontractor_specialties')
          .select('id, specialty, description');
        
        if (error) {
          throw error;
        }
        
        const specialtiesMap: Record<string, Specialty> = {};
        data?.forEach(specialty => {
          specialtiesMap[specialty.id] = specialty;
        });
        
        setSpecialties(specialtiesMap);
      } catch (error: any) {
        console.error('Error fetching specialties:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecialties();
  }, []);
  
  return { specialties, loading, error };
};
