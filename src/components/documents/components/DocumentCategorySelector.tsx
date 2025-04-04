import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { 
  DocumentUploadFormValues,
  EntityType,
  getEntityCategories 
} from '../schemas/documentSchema';

interface DocumentCategorySelectorProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
  entityType?: EntityType;
}

const DocumentCategorySelector: React.FC<DocumentCategorySelectorProps> = ({ 
  control, 
  isReceiptUpload = false,
  entityType
}) => {
  // Get available categories based on entity type
  const availableCategories = entityType ? getEntityCategories(entityType) : [];

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
              {/* Show receipt and invoice options for all entity types */}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="receipt" id="receipt-doc" />
                <label htmlFor="receipt-doc" className="text-sm font-normal cursor-pointer">Receipt</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="invoice" id="invoice-doc" />
                <label htmlFor="invoice-doc" className="text-sm font-normal cursor-pointer">Invoice</label>
              </div>
              
              {/* Show 3rd_party_estimate only for certain entity types */}
              {(!entityType || ['PROJECT', 'ESTIMATE', 'CUSTOMER'].includes(entityType)) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3rd_party_estimate" id="estimate-doc" />
                  <label htmlFor="estimate-doc" className="text-sm font-normal cursor-pointer">Estimate</label>
                </div>
              )}
              
              {/* Show contract for most entity types */}
              {(!entityType || ['PROJECT', 'CUSTOMER', 'VENDOR', 'SUBCONTRACTOR', 'ESTIMATE'].includes(entityType)) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contract" id="contract-doc" />
                  <label htmlFor="contract-doc" className="text-sm font-normal cursor-pointer">Contract</label>
                </div>
              )}
              
              {/* Insurance primarily for VENDOR/SUBCONTRACTOR */}
              {(!entityType || ['VENDOR', 'SUBCONTRACTOR'].includes(entityType)) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="insurance" id="insurance-doc" />
                  <label htmlFor="insurance-doc" className="text-sm font-normal cursor-pointer">Insurance</label>
                </div>
              )}
              
              {/* Certification primarily for VENDOR/SUBCONTRACTOR */}
              {(!entityType || ['VENDOR', 'SUBCONTRACTOR'].includes(entityType)) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="certification" id="certification-doc" />
                  <label htmlFor="certification-doc" className="text-sm font-normal cursor-pointer">Certification</label>
                </div>
              )}
              
              {/* Photos for projects and work orders */}
              {(!entityType || ['PROJECT', 'WORK_ORDER'].includes(entityType)) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="photo" id="photo-doc" />
                  <label htmlFor="photo-doc" className="text-sm font-normal cursor-pointer">Photo</label>
                </div>
              )}
              
              {/* Other is always available */}
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
