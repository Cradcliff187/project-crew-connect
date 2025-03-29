
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Vendor } from '@/components/documents/vendor-selector/hooks/useVendorOptions';

interface VendorSelectorProps {
  index: number;
  vendors: Vendor[];
  loading: boolean;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ index, vendors, loading }) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.vendor_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor</FormLabel>
            <Select value={field.value || "none"} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading..." : "Select vendor"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Select vendor</SelectItem>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                    {vendor.vendorname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VendorSelector;
