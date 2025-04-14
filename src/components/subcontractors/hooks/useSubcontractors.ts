import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Subcontractor } from '../utils/types';

export const useSubcontractors = () => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubcontractors = async () => {
    setLoading(true);
    try {
      console.log('Fetching subcontractors from subcontractors table');
      const { data, error } = await supabase
        .from('subcontractors') // Changed from 'subcontractors_new' to 'subcontractors'
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Subcontractors data received:', data);

      // Ensure any null values are properly handled and convert specialty_ids to string[]
      const processedData = data?.map(sub => ({
        ...sub,
        // Convert UUID[] to string[] for specialty_ids if it exists
        specialty_ids: Array.isArray(sub.specialty_ids)
          ? sub.specialty_ids.map(id => String(id))
          : [],
        payment_terms: sub.payment_terms || 'NET30',
        notes: sub.notes || null,
      })) as Subcontractor[];

      console.log('Processed subcontractors data:', processedData);
      setSubcontractors(processedData || []);
    } catch (error: any) {
      console.error('Error fetching subcontractors:', error);
      setError(error.message);
      toast({
        title: 'Error fetching subcontractors',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcontractors();

    // Set up real-time subscription
    const channel = supabase
      .channel('subcontractors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subcontractors', // Changed from 'subcontractors_new' to 'subcontractors'
        },
        payload => {
          console.log('Realtime update:', payload);
          fetchSubcontractors(); // Refresh the data when changes occur
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    subcontractors,
    loading,
    error,
    refetch: fetchSubcontractors,
  };
};

export default useSubcontractors;
