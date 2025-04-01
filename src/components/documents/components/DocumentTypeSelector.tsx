
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues, documentCategories } from '../schemas/documentSchema';

interface DocumentTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
  instanceId?: string;
}

const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({ 
  control,
  instanceId = 'default-doc-type'
}) => {
  return (
    <FormField
      control={control}
      name="metadata.category"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Document Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
              id={`document-type-${instanceId}`}
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="receipt" id={`receipt-${instanceId}`} />
                </FormControl>
                <FormLabel htmlFor={`receipt-${instanceId}`} className="font-normal">
                  Receipt
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="invoice" id={`invoice-${instanceId}`} />
                </FormControl>
                <FormLabel htmlFor={`invoice-${instanceId}`} className="font-normal">
                  Invoice
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="contract" id={`contract-${instanceId}`} />
                </FormControl>
                <FormLabel htmlFor={`contract-${instanceId}`} className="font-normal">
                  Contract
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="other" id={`other-${instanceId}`} />
                </FormControl>
                <FormLabel htmlFor={`other-${instanceId}`} className="font-normal">
                  Other
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default React.memo(DocumentTypeSelector);
