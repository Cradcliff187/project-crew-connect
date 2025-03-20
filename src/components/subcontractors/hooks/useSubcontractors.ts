
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
      // Updated to use the new consolidated table
      const { data, error } = await supabase
        .from('subcontractors_new')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Ensure any null values are properly handled
      const processedData = data?.map(sub => ({
        ...sub,
        // Set default values for fields that might be null
        specialty_ids: sub.specialty_ids || [],
        payment_terms: sub.payment_terms || "NET30",
        notes: sub.notes || null
      })) as Subcontractor[];
      
      setSubcontractors(processedData || []);
    } catch (error: any) {
      console.error('Error fetching subcontractors:', error);
      setError(error.message);
      toast({
        title: 'Error fetching subcontractors',
        description: error.message,
        variant: 'destructive'
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
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'subcontractors_new' // Updated to the new table name
        }, 
        (payload) => {
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
    refetch: fetchSubcontractors
  };
};

export default useSubcontractors;
