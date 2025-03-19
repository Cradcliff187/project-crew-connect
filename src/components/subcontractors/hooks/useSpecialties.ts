
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Specialty } from '../utils/types';

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Record<string, Specialty>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  useEffect(() => {
    fetchSpecialties();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('specialties-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'subcontractor_specialties' 
        }, 
        (payload) => {
          console.log('Specialty update:', payload);
          fetchSpecialties(); // Refresh the data when changes occur
        }
      )
      .subscribe();
    
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { 
    specialties, 
    loading, 
    error,
    refetch: fetchSpecialties
  };
};

export default useSpecialties;
