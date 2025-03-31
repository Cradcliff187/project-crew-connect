
import React, { useEffect, useState } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  vendorType: 'vendor' | 'subcontractor' | 'other';
  prefillVendorId?: string;
  instanceId?: string; // Added instanceId prop
}

type Vendor = {
  id: string;
  name: string;
};

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control, 
  vendorType, 
  prefillVendorId,
  instanceId = 'default-vendor'  // Default value
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        if (vendorType === 'vendor') {
          const { data } = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname');
          
          if (data) {
            setVendors(data.map(v => ({ id: v.vendorid, name: v.vendorname })));
          }
        } else if (vendorType === 'subcontractor') {
          const { data } = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname');
          
          if (data) {
            setVendors(data.map(s => ({ id: s.subid, name: s.subname })));
          }
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorType === 'vendor' || vendorType === 'subcontractor') {
      fetchVendors();
    }
  }, [vendorType]);

  // Check if the prefill value is set
  useEffect(() => {
    if (prefillVendorId && vendors.length > 0) {
      const vendorExists = vendors.some(v => v.id === prefillVendorId);
      if (vendorExists) {
        // Set the form value
        // (We're not calling this directly in render to avoid rendering issues)
        setTimeout(() => {
          // This will be handled by the form controller
        }, 0);
      }
    }
  }, [prefillVendorId, vendors]);

  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {vendorType === 'vendor' ? 'Vendor' : 
             vendorType === 'subcontractor' ? 'Subcontractor' : 
             'Source'}
          </FormLabel>
          {vendorType === 'other' ? (
            <FormControl>
              <Input 
                {...field}
                id={`${instanceId}-vendor-input`}
                placeholder="Enter source name"
              />
            </FormControl>
          ) : vendors.length > 0 ? (
            <Select
              value={field.value || prefillVendorId || ''}
              onValueChange={field.onChange}
              defaultValue={prefillVendorId}
            >
              <FormControl>
                <SelectTrigger id={`${instanceId}-vendor-select`} className={loading ? "opacity-70" : ""}>
                  <SelectValue 
                    placeholder={`Select a ${vendorType === 'vendor' ? 'vendor' : 'subcontractor'}`}
                  />
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
            <FormControl>
              <Input 
                {...field}
                id={`${instanceId}-vendor-fallback`}
                placeholder={loading ? "Loading..." : `Enter ${vendorType} ID or name`}
                disabled={loading}
              />
            </FormControl>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
