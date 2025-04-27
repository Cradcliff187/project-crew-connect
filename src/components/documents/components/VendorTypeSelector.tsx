import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import {
  DocumentUploadFormValues,
  vendorTypes,
  expenseTypeRequiresVendor,
  expenseTypeAllowsSubcontractor,
} from '../schemas/documentSchema';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
  watchExpenseType?: string;
}

const VendorTypeSelector: React.FC<VendorTypeSelectorProps> = ({ control, watchExpenseType }) => {
  return (
    <FormField
      control={control}
      name="metadata.vendorType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Vendor Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value || 'vendor'}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {vendorTypes.map(type => (
                <SelectItem
                  key={type}
                  value={type}
                  disabled={
                    watchExpenseType &&
                    ((type === 'vendor' && !expenseTypeRequiresVendor(watchExpenseType)) ||
                      (type === 'subcontractor' &&
                        !expenseTypeAllowsSubcontractor(watchExpenseType)))
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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

export default VendorTypeSelector;
