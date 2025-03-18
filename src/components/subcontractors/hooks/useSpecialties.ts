
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Specialty } from '../utils/subcontractorUtils';

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Record<string, Specialty>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = async () => {
    try {
      const { data, error } = await supabase
        .from('subcontractor_specialties')
        .select('id, specialty');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const specialtiesMap: Record<string, Specialty> = {};
        data.forEach(specialty => {
          specialtiesMap[specialty.id] = specialty;
        });
        setSpecialties(specialtiesMap);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching specialties:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  return { specialties, loading: loading, error, refetch: fetchSpecialties };
};
