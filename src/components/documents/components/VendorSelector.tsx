
import React, { useEffect, useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType: 'vendor' | 'subcontractor' | 'other';
  prefillVendorId?: string;
  instanceId?: string; // Added instanceId prop
}

interface VendorOption {
  id: string;
  name: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control, 
  vendorType,
  prefillVendorId,
  instanceId = 'default-vendor'  // Default value
}) => {
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch vendors based on vendor type
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        let data: VendorOption[] = [];
        
        if (vendorType === 'vendor') {
          const { data: vendorsData } = await supabase
            .from('vendors')
            .select('vendorid, vendorname');
          
          data = (vendorsData || []).map(v => ({ 
            id: v.vendorid, 
            name: v.vendorname || v.vendorid 
          }));
        } else if (vendorType === 'subcontractor') {
          const { data: subsData } = await supabase
            .from('subcontractors')
            .select('subid, subname');
          
          data = (subsData || []).map(s => ({ 
            id: s.subid, 
            name: s.subname || s.subid 
          }));
        }
        
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, [vendorType]);
  
  // Set prefill value when available
  useEffect(() => {
    if (prefillVendorId) {
      // For debugging
      console.log(`Setting prefill vendor ID: ${prefillVendorId}`);
    }
  }, [prefillVendorId]);
  
  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{vendorType === 'subcontractor' ? 'Subcontractor' : 'Vendor'}</FormLabel>
          {vendors.length > 0 ? (
            <Select
              value={field.value || prefillVendorId}
              onValueChange={field.onChange}
              defaultValue={prefillVendorId}
            >
              <FormControl>
                <SelectTrigger id={`${instanceId}-vendor-trigger`}>
                  <SelectValue placeholder={`Select a ${vendorType === 'subcontractor' ? 'subcontractor' : 'vendor'}`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select disabled>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "No options available"} />
                </SelectTrigger>
              </FormControl>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
