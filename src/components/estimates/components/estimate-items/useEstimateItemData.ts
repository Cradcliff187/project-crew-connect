
import { useState, useEffect } from 'react';

export const useEstimateItemData = () => {
  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);
  const [subcontractors, setSubcontractors] = useState<{ subid: string; subname: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Dynamically import supabase to reduce initial load time
        const { supabase } = await import('@/integrations/supabase/client');
        
        // Use Promise.all to fetch data in parallel
        const [vendorsResult, subcontractorsResult] = await Promise.all([
          supabase.from('vendors').select('vendorid, vendorname').order('vendorname'),
          supabase.from('subcontractors').select('subid, subname').order('subname')
        ]);

        if (vendorsResult.error) {
          console.error('Error fetching vendors:', vendorsResult.error);
        } else {
          setVendors(vendorsResult.data || []);
        }

        if (subcontractorsResult.error) {
          console.error('Error fetching subcontractors:', subcontractorsResult.error);
        } else {
          setSubcontractors(subcontractorsResult.data || []);
        }
      } catch (error) {
        console.error('Error loading estimate item data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // We only want to load this data once when the component mounts
  }, []);

  return { vendors, subcontractors, loading };
};
