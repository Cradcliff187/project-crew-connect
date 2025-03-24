
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, vendorTypes } from '../schemas/documentSchema';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
}

const VendorTypeSelector: React.FC<VendorTypeSelectorProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="metadata.vendorType"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Vendor Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vendor" id="vendor-type" />
                <label htmlFor="vendor-type" className="text-sm font-normal cursor-pointer">Supplier</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subcontractor" id="subcontractor-type" />
                <label htmlFor="subcontractor-type" className="text-sm font-normal cursor-pointer">Subcontractor</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other-type" />
                <label htmlFor="other-type" className="text-sm font-normal cursor-pointer">Other</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorTypeSelector;
