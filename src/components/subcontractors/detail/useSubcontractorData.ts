
import { useState, useEffect } from 'react';
import { Subcontractor } from '../utils/types';
import useSubcontractorCompliance from '../hooks/useSubcontractorCompliance';
import useSubcontractorSpecialties from '../hooks/useSubcontractorSpecialties';
import useFetchSubcontractor from '../hooks/useFetchSubcontractor';
import useAssociatedData from '../hooks/useAssociatedData';

export const useSubcontractorData = (subcontractorId: string | undefined) => {
  const [loading, setLoading] = useState(true);

  // Use our custom hooks to get specialized data
  const { compliance, loading: loadingCompliance } = useSubcontractorCompliance(subcontractorId);
  const { specialtyIds, loading: loadingSpecialtyIds } = useSubcontractorSpecialties(subcontractorId);
  
  // Use our newly created hooks
  const { subcontractor, specialties, fetchSubcontractor } = useFetchSubcontractor();
  const { projects, workOrders, loadingAssociations, fetchAssociatedData } = useAssociatedData();

  // Function to refetch all subcontractor data
  const fetchAllData = async () => {
    if (!subcontractorId) return;
    
    setLoading(true);
    const subData = await fetchSubcontractor(subcontractorId);
    
    if (subData) {
      // Fetch associated data if we got the main subcontractor data
      await fetchAssociatedData(subData.subid);
    }
    
    setLoading(false);
  };

  // Main effect to fetch data when subcontractor ID changes
  useEffect(() => {
    if (!loadingCompliance && !loadingSpecialtyIds) {
      fetchAllData();
    }
  }, [subcontractorId, loadingCompliance, loadingSpecialtyIds]);

  return {
    subcontractor,
    loading: loading || loadingCompliance || loadingSpecialtyIds,
    specialties,
    projects,
    workOrders,
    loadingAssociations,
    fetchSubcontractor: fetchAllData,
  };
};

export default useSubcontractorData;
