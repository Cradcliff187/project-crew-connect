import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Vendor {
  vendorid: string;
  vendorname: string;
}

export interface VendorBasic {
  vendorid: string;
  vendorname: string;
}

export interface SubcontractorBasic {
  subid: string;
  company_name: string;
  contact_name?: string;
}

export interface VendorOptionsHookResult {
  vendorOptions: Vendor[];
  subcontractorOptions: SubcontractorBasic[];
  isLoading: boolean;
  refreshVendors: () => Promise<void>;
}

export const useVendorOptions = (): VendorOptionsHookResult => {
  const [vendorOptions, setVendorOptions] = useState<Vendor[]>([]);
  const [subcontractorOptions, setSubcontractorOptions] = useState<SubcontractorBasic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      // Fetch vendors
      const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .order('vendorname');

      if (vendorError) {
        console.error('Error fetching vendors:', vendorError);
        throw vendorError;
      }

      // Fetch subcontractors
      const { data: subcontractors, error: subError } = await supabase
        .from('subcontractors')
        .select('subid, company_name, contact_name')
        .order('company_name', { ascending: true });

      if (subError) {
        console.error('Error fetching subcontractors:', subError);
        throw subError;
      }

      if (vendors) {
        setVendorOptions(vendors);
      }

      if (subcontractors) {
        const subs = subcontractors.map(sub => ({
          subid: sub.subid,
          company_name: sub.company_name || sub.contact_name || 'Unnamed Subcontractor',
        }));
        setSubcontractorOptions(subs);
      }
    } catch (error) {
      console.error('Error fetching vendors/subcontractors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the function to prevent unnecessary re-renders
  const refreshVendors = useCallback(async () => {
    await fetchData();
  }, []);

  // Fetch data on initial render
  useEffect(() => {
    fetchData();
  }, []);

  return {
    vendorOptions,
    subcontractorOptions,
    isLoading,
    refreshVendors,
  };
};
