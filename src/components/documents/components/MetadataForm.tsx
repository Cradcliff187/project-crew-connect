
import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DocumentCategorySelector } from '../DocumentCategorySelector';
import { ExpenseTypeSelector } from './ExpenseTypeSelector';
import { VendorSelector } from '../vendor-selector/VendorSelector';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface MetadataFormProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: string;
  isReceiptUpload?: boolean;
  showVendorSelector?: boolean;
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
  showVendorSelector = false,
  prefillData
}) => {
  // Set document name based on expense name or material name if available
  const documentName = prefillData?.expenseName || prefillData?.materialName || '';
  
  // Show simplified form for receipt uploads with prefill data
  if (isReceiptUpload && prefillData) {
    return (
      <div className="space-y-4">
        <FormField
          control={control}
          name="metadata.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any notes about this receipt..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Only show vendor selector if this is a receipt upload without vendor ID prefilled */}
        {(!prefillData.vendorId && showVendorSelector) && (
          <div className="pt-2">
            <VendorSelector
              form={form}
              initialVendorId={prefillData?.vendorId}
              vendorType={watchVendorType}
              isExpense={true}
            />
          </div>
        )}
      </div>
    );
  }
  
  // Show full metadata form for other document uploads
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="metadata.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter document title..." 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DocumentCategorySelector control={control} />
      
      {watchIsExpense && (
        <>
          <ExpenseTypeSelector control={control} />
          
          <FormField
            control={control}
            name="metadata.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      
      {showVendorSelector && (
        <VendorSelector
          form={form}
          initialVendorId={prefillData?.vendorId}
          vendorType={watchVendorType}
          isExpense={watchIsExpense}
        />
      )}
      
      <FormField
        control={control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (Optional)</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Add any notes about this document..."
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MetadataForm;
