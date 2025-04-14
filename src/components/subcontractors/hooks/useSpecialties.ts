import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Specialty } from '../utils/types';
import { toast } from 'sonner';

export const useSpecialties = () => {
  const [specialties, setSpecialties] = useState<Record<string, Specialty>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subcontractor_specialties')
        .select('id, specialty, description')
        .order('specialty');

      if (error) {
        throw error;
      }

      const specialtiesMap: Record<string, Specialty> = {};
      data?.forEach(specialty => {
        specialtiesMap[specialty.id] = specialty;
      });

      setSpecialties(specialtiesMap);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching specialties:', error);
      setError(error.message);
      toast.error('Failed to load specialties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialties();

    // Set up real-time subscription for specialty changes
    const channel = supabase
      .channel('specialties-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subcontractor_specialties',
        },
        () => {
          fetchSpecialties(); // Refresh the data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSpecialties]);

  return {
    specialties,
    loading,
    error,
    refetch: fetchSpecialties,
  };
};

export default useSpecialties;
