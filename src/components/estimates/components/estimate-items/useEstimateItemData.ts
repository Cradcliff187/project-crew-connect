import { useState, useEffect, useCallback, useRef } from 'react';

export const useEstimateItemData = () => {
  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);
  const [subcontractors, setSubcontractors] = useState<{ subid: string; subname: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const dataFetchedRef = useRef(false);

  // Memoize the loadData function to prevent recreation on each render
  const loadData = useCallback(async () => {
    // Skip if data has already been fetched
    if (dataFetchedRef.current) {
      return;
    }

    try {
      setLoading(true);
      // Dynamically import supabase to reduce initial load time
      const { supabase } = await import('@/integrations/supabase/client');

      // Use Promise.all to fetch data in parallel
      const [vendorsResult, subcontractorsResult] = await Promise.all([
        supabase.from('vendors').select('vendorid, vendorname').order('vendorname'),
        supabase.from('subcontractors').select('subid, subname').order('subname'),
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

      // Mark data as fetched so we don't fetch it again
      dataFetchedRef.current = true;
    } catch (error) {
      console.error('Error loading estimate item data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use useEffect with an empty dependency array to ensure we only load data once
  useEffect(() => {
    loadData();
  }, []);

  return { vendors, subcontractors, loading };
};
