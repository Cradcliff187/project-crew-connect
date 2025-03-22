
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from './schemas/documentSchema';

interface VendorSelectorProps {
  control: Control<DocumentUploadFormValues>;
  prefillVendorId?: string;
  disabled?: boolean;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control, 
  prefillVendorId, 
  disabled = false 
}) => {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .order('vendorname');
      
      if (error) {
        console.error('Error fetching vendors list:', error);
        return [];
      }
      
      return data.map(vendor => ({
        id: vendor.vendorid,
        name: vendor.vendorname
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor</FormLabel>
          <Select
            value={field.value || ''}
            onValueChange={(value: string) => field.onChange(value)}
            disabled={isLoading || disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Vendor" />
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
