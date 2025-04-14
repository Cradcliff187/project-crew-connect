import React, { useState, useEffect, memo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorSelectorProps {
  index: number;
  vendors: { vendorid: string; vendorname: string }[];
  loading: boolean;
}

const VendorSelector = memo(({ index, vendors, loading }: VendorSelectorProps) => {
  const form = useFormContext();
  const [vendorOptions, setVendorOptions] = useState<{ value: string; label: string }[]>([]);

  // Prepare vendor options only once when vendors change
  useEffect(() => {
    if (vendors && vendors.length > 0) {
      setVendorOptions(
        vendors.map(vendor => ({
          value: vendor.vendorid,
          label: vendor.vendorname,
        }))
      );
    }
  }, [vendors]);

  return (
    <div className="col-span-12 md:col-span-6">
      <FormField
        control={form.control}
        name={`items.${index}.vendor_id`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor</FormLabel>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading || vendorOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
});

VendorSelector.displayName = 'VendorSelector';

export default VendorSelector;
