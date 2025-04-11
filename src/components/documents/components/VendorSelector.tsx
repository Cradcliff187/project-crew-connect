
import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface VendorSelectorProps {
  control: Control<any>;
  initialVendorId?: string;
}

interface Vendor {
  vendorid: string;
  vendorname: string;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  control,
  initialVendorId
}) => {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .order('vendorname');
        
      if (error) throw error;
      return data as Vendor[];
    }
  });

  return (
    <FormField
      control={control}
      name="metadata.vendorId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || initialVendorId || ''} 
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Vendors</SelectLabel>
                {vendors?.map((vendor) => (
                  <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                    {vendor.vendorname}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorSelector;
