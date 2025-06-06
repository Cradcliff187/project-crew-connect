import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Vendor {
  vendorid: string;
  vendorname: string;
}

export interface SubcontractorBasic {
  subid: string;
  subname: string;
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
        .select('subid, company_name')
        .order('company_name');

      if (subError) {
        console.error('Error fetching subcontractors:', subError);
        return;
      }

      const mappedSubcontractors = (subcontractors || []).map(sub => ({
        subid: sub.subid,
        subname: sub.company_name, // Map for backward compatibility
      }));

      setVendorOptions(vendors || []);
      setSubcontractorOptions(mappedSubcontractors);
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
