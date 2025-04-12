
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Badge } from '@/components/ui/badge';
import { StoreIcon } from 'lucide-react';
import VendorSearchCombobox from '@/components/documents/vendor-selector/VendorSearchCombobox';

interface VendorSelectorProps {
  index: number;
  vendors: { vendorid: string; vendorname: string }[];
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
                onChange={(value) => field.onChange(value)}
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
};

export default VendorSelector;
