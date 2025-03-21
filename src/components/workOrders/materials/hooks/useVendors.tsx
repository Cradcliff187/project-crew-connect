
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVendors() {
  const [vendors, setVendors] = useState<{ vendorid: string, vendorname: string }[]>([]);
  
  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .eq('status', 'ACTIVE');
      
      if (error) {
        throw error;
      }
      
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };
  
  useEffect(() => {
    fetchVendors();
  }, []);
  
  return {
    vendors,
    fetchVendors
  };
}
