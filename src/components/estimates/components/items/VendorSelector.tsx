
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

type Vendor = { vendorid: string; vendorname: string };

interface VendorSelectorProps {
  control: Control<EstimateFormValues>;
  index: number;
  vendors: Vendor[];
  loading: boolean;
}

const VendorSelector = ({ control, index, vendors, loading }: VendorSelectorProps) => {
  return (
    <FormField
      control={control}
      name={`items.${index}.vendor_id`}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "Select vendor"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
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
  );
};

export default VendorSelector;
