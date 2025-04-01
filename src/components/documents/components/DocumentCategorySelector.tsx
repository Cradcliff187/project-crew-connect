
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, documentCategories } from '../schemas/documentSchema';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
}

const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({ 
  control, 
  isReceiptUpload = false 
}) => {
  if (isReceiptUpload) {
    return (
      <FormField
        control={control}
        name="metadata.category"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Receipt Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="receipt" id="receipt" />
                  <label htmlFor="receipt" className="text-sm font-normal cursor-pointer">Material Receipt</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="invoice" id="invoice" />
                  <label htmlFor="invoice" className="text-sm font-normal cursor-pointer">Subcontractor Invoice</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <FormField
      control={control}
      name="metadata.category"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Document Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receipt" id="receipt-doc" />
                <label htmlFor="receipt-doc" className="text-sm font-normal cursor-pointer">Receipt</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invoice" id="invoice-doc" />
                <label htmlFor="invoice-doc" className="text-sm font-normal cursor-pointer">Invoice</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3rd_party_estimate" id="estimate-doc" />
                <label htmlFor="estimate-doc" className="text-sm font-normal cursor-pointer">Estimate</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contract" id="contract-doc" />
                <label htmlFor="contract-doc" className="text-sm font-normal cursor-pointer">Contract</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="insurance" id="insurance-doc" />
                <label htmlFor="insurance-doc" className="text-sm font-normal cursor-pointer">Insurance</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="certification" id="certification-doc" />
                <label htmlFor="certification-doc" className="text-sm font-normal cursor-pointer">Certification</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="photo" id="photo-doc" />
                <label htmlFor="photo-doc" className="text-sm font-normal cursor-pointer">Photo</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other-doc" />
                <label htmlFor="other-doc" className="text-sm font-normal cursor-pointer">Other</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentCategorySelector;
