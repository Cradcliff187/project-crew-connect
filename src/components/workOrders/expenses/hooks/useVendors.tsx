import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useVendors() {
  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching vendors');
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .eq('status', 'ACTIVE') // Only fetch active vendors
        .order('vendorname', { ascending: true });

      if (error) {
        throw error;
      }

      console.log('Fetched vendors:', data);
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load vendors: ' + error.message,
        variant: 'destructive',
      });
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
