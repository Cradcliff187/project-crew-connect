
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
  instanceId?: string; // Added instanceId prop
}

const VendorTypeSelector: React.FC<VendorTypeSelectorProps> = ({ 
  control,
  instanceId = 'default-vendor-type'  // Default value
}) => {
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
                <RadioGroupItem value="vendor" id={`${instanceId}-vendor-type`} />
                <label htmlFor={`${instanceId}-vendor-type`} className="text-sm font-normal cursor-pointer">Vendor/Supplier</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subcontractor" id={`${instanceId}-subcontractor-type`} />
                <label htmlFor={`${instanceId}-subcontractor-type`} className="text-sm font-normal cursor-pointer">Subcontractor</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id={`${instanceId}-other-type`} />
                <label htmlFor={`${instanceId}-other-type`} className="text-sm font-normal cursor-pointer">Other</label>
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
