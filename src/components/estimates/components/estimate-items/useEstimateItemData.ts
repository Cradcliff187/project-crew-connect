
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEstimateItemData = () => {
  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);
  const [subcontractors, setSubcontractors] = useState<{ subid: string; subname: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vendors
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');
          
        if (vendorError) throw vendorError;
        setVendors(vendorData || []);
        
        // Fetch subcontractors
        const { data: subData, error: subError } = await supabase
          .from('subcontractors')
          .select('subid, subname')
          .order('subname');
          
        if (subError) throw subError;
        setSubcontractors(subData || []);
      } catch (error) {
        console.error('Error fetching vendors and subcontractors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return {
    vendors,
    subcontractors,
    loading
  };
};
