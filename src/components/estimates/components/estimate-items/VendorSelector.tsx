
import React, { memo } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Badge } from '@/components/ui/badge';
import { StoreIcon } from 'lucide-react';
import VendorSearchCombobox from './VendorSearchCombobox'; 

interface VendorSelectorProps {
  index: number;
  vendors: { vendorid: string; vendorname: string }[];
  loading: boolean;
}

// Optimized vendor selector with memoization
const VendorSelector: React.FC<VendorSelectorProps> = memo(({ index, vendors, loading }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Function to handle value changes efficiently
  const handleVendorChange = (value: string) => {
    form.setValue(`items.${index}.vendor_id`, value, {
      shouldDirty: true,
      shouldValidate: false
    });
  };
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.vendor_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1">
              <StoreIcon className="h-3.5 w-3.5 text-[#0485ea]" />
              <span>Vendor</span>
              {vendors.length > 0 && (
                <Badge variant="outline" className="ml-1 text-xs bg-blue-50">
                  {vendors.length}
                </Badge>
              )}
            </FormLabel>
            <FormControl>
              <VendorSearchCombobox
                value={field.value || ""}
                onChange={handleVendorChange}
                vendorType="vendor"
                placeholder={loading ? "Loading vendors..." : "Select vendor"}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
});

VendorSelector.displayName = 'VendorSelector';

export default VendorSelector;
