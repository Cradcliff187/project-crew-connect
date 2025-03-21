
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for vendors and subcontractors
type Vendor = { vendorid: string; vendorname: string };
type Subcontractor = { subid: string; subname: string };

export const useEstimateItems = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load vendors and subcontractors
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
        console.log('Subcontractors fetched:', subData);
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
