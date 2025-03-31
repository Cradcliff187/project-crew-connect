
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface VendorTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
  instanceId?: string; // Added instanceId prop
}

const vendorTypes = [
  { value: 'vendor', label: 'Vendor/Supplier' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'other', label: 'Other' }
];

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
              className="flex flex-wrap gap-4"
            >
              {vendorTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={`${instanceId}-vendor-type-${type.value}`} />
                  <label 
                    htmlFor={`${instanceId}-vendor-type-${type.value}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default VendorTypeSelector;
