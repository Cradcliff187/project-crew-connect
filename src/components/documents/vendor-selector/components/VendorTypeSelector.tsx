import React from 'react';
import { Control, useController } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../../schemas/documentSchema';
import { cn } from '@/lib/utils';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
  onChange?: (value: 'vendor' | 'subcontractor' | 'none') => void;
}

const VendorTypeSelector: React.FC<VendorTypeSelectorProps> = ({ control, onChange }) => {
  // Get controller for the vendorId field outside of the render function
  const vendorIdController = useController({
    control,
    name: 'metadata.vendorId',
  });

  const handleVendorTypeChange = (value: string) => {
    // First update the vendor type
    control._formValues.metadata.vendorType = value;

    // Then reset the vendor ID
    vendorIdController.field.onChange('');
  };

  return (
    <FormField
      control={control}
      name="metadata.vendorType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Payee Category</FormLabel>
          <Select
            onValueChange={value => {
              // First update the vendor type
              field.onChange(value);
              // Reset the vendor ID when changing type
              handleVendorTypeChange(value);
              // Then call the parent onChange handler if provided
              if (onChange) {
                onChange(value as 'vendor' | 'subcontractor' | 'none');
              }
            }}
            value={field.value || ''}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  'bg-white',
                  field.value && 'text-foreground',
                  !field.value && 'text-muted-foreground'
                )}
              >
                <SelectValue placeholder="Select payee category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="subcontractor">Independent Contractor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorTypeSelector;
