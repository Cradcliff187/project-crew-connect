
import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DocumentCategorySelector from '../DocumentCategorySelector';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import VendorSelector from '../vendor-selector/VendorSelector';
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
              control={control}
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
      {/* Document Title Field */}
      <FormField
        control={control}
        name="metadata.category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter document title..." 
                value={documentName || ''} 
                onChange={(e) => {
                  // Instead of trying to set a non-existent field, store title in tags or notes
                  const title = e.target.value;
                  // Update tags array with the title as first tag
                  form.setValue('metadata.tags', [title, ...form.watch('metadata.tags').filter((_, i) => i > 0)], { shouldValidate: true });
                  // Also update notes to include the title
                  const currentNotes = form.watch('metadata.notes') || '';
                  if (!currentNotes.includes('Title:')) {
                    form.setValue('metadata.notes', `Title: ${title}\n${currentNotes}`, { shouldValidate: true });
                  } else {
                    // Replace existing title in notes
                    form.setValue(
                      'metadata.notes', 
                      currentNotes.replace(/Title:.*(\n|$)/, `Title: ${title}\n`),
                      { shouldValidate: true }
                    );
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DocumentCategorySelector value={form.watch('metadata.category')} onChange={(value) => form.setValue('metadata.category', value)} />
      
      {watchIsExpense && (
        <>
          <FormField
            control={control}
            name="metadata.expenseType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Type</FormLabel>
                <FormControl>
                  <ExpenseTypeSelector 
                    value={field.value || 'materials'} 
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                    value={field.value?.toString() || ''}
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
          control={control}
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
