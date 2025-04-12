
import React, { memo, useState, useEffect, useRef } from 'react';
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

// Optimized vendor selector with memoization and lazy loading
const VendorSelector = memo(({ index, vendors, loading }: VendorSelectorProps) => {
  const form = useFormContext<EstimateFormValues>();
  const currentValue = form.watch(`items.${index}.vendor_id`);
  const previousValueRef = useRef(currentValue);
  const [isDirty, setIsDirty] = useState(false);
  
  // Only update the ref when the value actually changes
  useEffect(() => {
    if (currentValue !== previousValueRef.current) {
      previousValueRef.current = currentValue;
      setIsDirty(true);
    }
  }, [currentValue]);
  
  // Function to handle value changes efficiently with minimal form updates
  const handleVendorChange = (value: string) => {
    if (value === form.getValues(`items.${index}.vendor_id`)) return;
    
    form.setValue(`items.${index}.vendor_id`, value, {
      shouldDirty: true,
      shouldValidate: false, // Prevent validation on each change
      shouldTouch: false // Don't mark as touched to reduce rerenders
    });
    
    setIsDirty(true);
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
