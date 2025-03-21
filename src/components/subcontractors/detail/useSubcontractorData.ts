
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Subcontractor } from '../utils/types';
import useSubcontractorSpecialties from '../hooks/useSubcontractorSpecialties';
import { useSubcontractorAssociatedData } from './hooks/useSubcontractorAssociatedData';

const useSubcontractorData = (subcontractorId: string | undefined) => {
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const { specialties } = useSubcontractorSpecialties(subcontractorId);
  
  // Use the associated data hook
  const { 
    projects, 
    workOrders, 
    loadingAssociations, 
    fetchAssociatedData 
  } = useSubcontractorAssociatedData();
  
  const fetchSubcontractor = async () => {
    if (!subcontractorId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcontractors_new')
        .select('*')
        .eq('subid', subcontractorId)
        .single();
        
      if (error) {
        console.error('Error fetching subcontractor:', error);
        throw error;
      }
      
      setSubcontractor(data);
      
      // Fetch associated data once we have the subcontractor
      fetchAssociatedData(subcontractorId);
      
    } catch (error) {
      console.error('Error in fetchSubcontractor:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSubcontractor();
  }, [subcontractorId]);
  
  return {
    subcontractor,
    loading,
    specialties,
    projects,
    workOrders,
    loadingAssociations,
    fetchSubcontractor
  };
};

export default useSubcontractorData;
