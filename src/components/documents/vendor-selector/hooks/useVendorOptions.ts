
import { useState, useEffect } from 'react';
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
        
      if (vendorError) throw vendorError;
      setVendorOptions(vendors || []);
      
      // Fetch subcontractors
      const { data: subcontractors, error: subError } = await supabase
        .from('subcontractors')
        .select('subid, subname')
        .order('subname');
        
      if (subError) throw subError;
      setSubcontractorOptions(subcontractors || []);
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    vendorOptions,
    subcontractorOptions,
    isLoading,
    refreshVendors: fetchData
  };
};
