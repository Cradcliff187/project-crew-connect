
import React, { useEffect } from 'react';
import { UseFormReturn, Control } from 'react-hook-form';
import { DocumentUploadFormValues, EntityType, entityTypes } from '../schemas/documentSchema';
import EntitySelector from './EntitySelector';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import DocumentCategorySelector from './DocumentCategorySelector';
import TagsInput from './TagsInput';
import AmountField from './AmountField';
import ExpenseDatePicker from './ExpenseDatePicker';
import VendorTypeSelector from './VendorTypeSelector';
import VendorSelector from './VendorSelector';
import NotesField from './NotesField';
import { FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  allowEntityTypeSelection?: boolean;
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  form,
  control,
  watchIsExpense,
  watchVendorType,
  isReceiptUpload = false,
  showVendorSelector,
  prefillData,
  allowEntityTypeSelection = false
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
  
  // Get the watchCategory and watchEntityType values
  const watchCategory = form.watch('metadata.category');
  const watchEntityType = form.watch('metadata.entityType');
  
  // Helper to determine if we should show expense fields
  const showExpenseFields = isReceiptUpload || watchIsExpense || 
                          watchCategory === 'receipt' || watchCategory === 'invoice';
  
  return (
    <div className="space-y-4">
      {allowEntityTypeSelection && (
        <FormField
          control={control}
          name="metadata.entityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the type of entity this document relates to
              </FormDescription>
            </FormItem>
          )}
        />
      )}

      {!isReceiptUpload && (
        <DocumentCategorySelector 
          control={control} 
          isReceiptUpload={isReceiptUpload} 
        />
      )}
      
      <EntitySelector 
        control={control} 
        isReceiptUpload={isReceiptUpload} 
        entityType={watchEntityType}
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
