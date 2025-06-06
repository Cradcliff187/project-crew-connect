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
      name="vendor_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Payee Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''}>
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select payee type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="subcontractor">Subcontractor</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorTypeSelector;
