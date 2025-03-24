
import React, { useEffect } from 'react';
import { UseFormReturn, Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import EntitySelector from './EntitySelector';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import DocumentCategorySelector from './DocumentCategorySelector';
import TagsInput from './TagsInput';
import AmountField from './AmountField';
import ExpenseDatePicker from './ExpenseDatePicker';
import VendorTypeSelector from './VendorTypeSelector';
import VendorSelector from './VendorSelector';
import NotesField from './NotesField';
import { FormDescription } from '@/components/ui/form';

interface MetadataFormProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: 'vendor' | 'subcontractor' | 'other' | undefined;
  isReceiptUpload?: boolean;
  showVendorSelector: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
    expenseName?: string;
  };
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  form,
  control,
  watchIsExpense,
  watchVendorType,
  isReceiptUpload = false,
  showVendorSelector,
  prefillData
}) => {
  // Set initial values from prefillData
  useEffect(() => {
    if (prefillData) {
      if (prefillData.amount) {
        form.setValue('metadata.amount', prefillData.amount);
      }
      if (prefillData.vendorId) {
        form.setValue('metadata.vendorId', prefillData.vendorId);
      }
      
      // Add any notes with material name if available
      if (prefillData.materialName || prefillData.expenseName) {
        const itemName = prefillData.materialName || prefillData.expenseName;
        form.setValue('metadata.notes', `Receipt for: ${itemName}`);
      }
    }
  }, [prefillData, form]);
  
  // Get the watchCategory value
  const watchCategory = form.watch('metadata.category');
  const watchEntityType = form.watch('metadata.entityType');
  
  // Helper to determine if we should show expense fields
  const showExpenseFields = isReceiptUpload || watchIsExpense || 
                          watchCategory === 'receipt' || watchCategory === 'invoice';
  
  return (
    <div className="space-y-4">
      {!isReceiptUpload && (
        <DocumentCategorySelector 
          control={control} 
          isReceiptUpload={isReceiptUpload} 
        />
      )}
      
      <EntitySelector 
        control={control} 
        isReceiptUpload={isReceiptUpload} 
      />
      
      {!isReceiptUpload && showExpenseFields && (
        <VendorTypeSelector control={control} />
      )}
      
      {showVendorSelector && watchVendorType && (
        <VendorSelector 
          control={control} 
          vendorType={watchVendorType} 
          prefillVendorId={prefillData?.vendorId} 
        />
      )}
      
      {showExpenseFields && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AmountField 
              control={control}
              isReceiptUpload={isReceiptUpload}
              prefillAmount={prefillData?.amount}
            />
            <ExpenseDatePicker control={control} />
          </div>
          
          <ExpenseTypeSelector control={control} />
        </>
      )}
      
      <TagsInput
        control={control}
        name="metadata.tags"
        label="Tags"
        description="Add tags to help organize and search for this document later"
      />
      
      <NotesField 
        control={control} 
        prefillText={prefillData?.materialName ? `Receipt for: ${prefillData.materialName}` : undefined} 
      />
      
      {watchEntityType && (
        <FormDescription>
          This document will be associated with {watchEntityType.replace(/_/g, ' ').toLowerCase()} records.
        </FormDescription>
      )}
    </div>
  );
};

export default MetadataForm;
