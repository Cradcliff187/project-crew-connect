
import React from 'react';
import { Control } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import DocumentCategorySelector from '../DocumentCategorySelector';
import ExpenseForm from '../ExpenseForm';
import VendorSelector from '../VendorSelector';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface MetadataFormProps {
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: string;
  isReceiptUpload: boolean;
  showVendorSelector: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
  };
}

const MetadataForm: React.FC<MetadataFormProps> = ({
  control,
  watchIsExpense,
  watchVendorType,
  isReceiptUpload,
  showVendorSelector,
  prefillData
}) => {
  if (isReceiptUpload && prefillData) {
    // Simplified metadata for prefilled receipt
    return (
      <FormField
        control={control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Receipt Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add any details about this receipt..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Separator />
      
      <div className="space-y-4">
        {!isReceiptUpload && (
          <FormField
            control={control}
            name="metadata.category"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Document Category</FormLabel>
                <FormControl>
                  <DocumentCategorySelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {!isReceiptUpload && (
          <FormField
            control={control}
            name="metadata.isExpense"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Expense Document
                  </FormLabel>
                  <FormDescription>
                    Mark this document as an expense record (invoice, receipt, etc.)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        
        {/* Only show vendor selector if not using prefilled data */}
        {showVendorSelector && !prefillData?.vendorId && (
          <VendorSelector 
            control={control} 
            watchVendorType={watchVendorType} 
          />
        )}
        
        {(watchIsExpense || isReceiptUpload) && !prefillData?.amount && (
          <ExpenseForm control={control} />
        )}
        
        <FormField
          control={control}
          name="metadata.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={isReceiptUpload 
                    ? "Add any details about this receipt..." 
                    : "Add any relevant notes about this document..."}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default MetadataForm;
