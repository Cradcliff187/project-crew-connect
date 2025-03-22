
import React from 'react';
import { Control, useController } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../../schemas/documentSchema';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
}

const VendorTypeSelector: React.FC<VendorTypeSelectorProps> = ({ control }) => {
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
              const vendorTypeController = useController({
                control,
                name: 'metadata.vendorId',
              });
              vendorTypeController.field.onChange('');
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
