
import React from 'react';
import { Control, useController } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../../schemas/documentSchema';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
}

const VendorTypeSelector: React.FC<VendorTypeSelectorProps> = ({ control }) => {
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
          <FormLabel>Vendor Type</FormLabel>
          <Select 
            value={field.value} 
            onValueChange={(value) => {
              field.onChange(value);
              // Reset the vendor ID when changing type
              handleVendorTypeChange(value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="vendor">Material Vendor</SelectItem>
              <SelectItem value="subcontractor">Subcontractor</SelectItem>
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
