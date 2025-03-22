
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { documentCategories } from '../schemas/documentSchema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VendorSelector from '../vendor-selector/VendorSelector';
import ExpenseForm from '../ExpenseForm';

interface MetadataFormProps {
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: string | undefined;
  isReceiptUpload?: boolean;
  showVendorSelector?: boolean;
  prefillData?: {
    amount?: number;
    vendorId?: string;
    materialName?: string;
  };
}

const MetadataForm = ({
  control,
  watchIsExpense,
  watchVendorType,
  isReceiptUpload = false,
  showVendorSelector = false,
  prefillData
}: MetadataFormProps) => {
  // If this is a receipt upload with prefill data, we can simplify the form
  const simplifiedForm = isReceiptUpload && prefillData;

  return (
    <div className="space-y-4">
      {!simplifiedForm && (
        <>
          <FormField
            control={control}
            name="metadata.category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Category</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentCategories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="capitalize"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="metadata.notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional context or details"
                    className="resize-none"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="metadata.isExpense"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Mark as Expense</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Enable to track cost information for this document
                  </p>
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
        </>
      )}

      {/* Show vendor selector if needed */}
      {(showVendorSelector || (watchIsExpense && !simplifiedForm)) && (
        <VendorSelector 
          control={control} 
          defaultVendorId={prefillData?.vendorId}
        />
      )}

      {/* Show expense form if isExpense is true or it's a receipt upload */}
      {(watchIsExpense || isReceiptUpload) && (
        <ExpenseForm
          control={control}
          isReceiptUpload={isReceiptUpload}
        />
      )}

      {/* Optional tags field */}
      {!simplifiedForm && (
        <FormField
          control={control}
          name="metadata.tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  {...field}
                  value={field.value.join(', ')}
                  onChange={(e) => {
                    const value = e.target.value;
                    const tags = value
                      ? value.split(',').map((tag) => tag.trim())
                      : [];
                    field.onChange(tags);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default MetadataForm;
