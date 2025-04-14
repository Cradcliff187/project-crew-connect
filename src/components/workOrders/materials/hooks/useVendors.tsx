import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useVendors() {
  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .eq('status', 'ACTIVE')
        .order('vendorname');

      if (error) throw error;

      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    loading,
    error,
    fetchVendors,
  };
}
