
import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import VendorSelector from '../vendor-selector/VendorSelector';
import { DocumentUploadFormValues, documentCategories, expenseTypes } from '../schemas/documentSchema';

interface MetadataFormProps {
  form: UseFormReturn<DocumentUploadFormValues>;
  control: Control<DocumentUploadFormValues>;
  watchIsExpense: boolean;
  watchVendorType: string | undefined;
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
  return (
    <div className="space-y-4">
      {/* Document Category */}
      <FormField
        control={control}
        name="metadata.category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Document Category</FormLabel>
            <Select 
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select document category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {documentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Is Expense Toggle */}
      {!isReceiptUpload && (
        <div className="flex items-center space-x-2">
          <Switch
            id="is-expense"
            checked={watchIsExpense}
            onCheckedChange={(checked) => {
              form.setValue('metadata.isExpense', checked);
            }}
          />
          <Label htmlFor="is-expense">This is an expense document</Label>
        </div>
      )}
      
      {/* Expense Type - only show for receipts/expenses */}
      {(watchIsExpense || isReceiptUpload) && (
        <FormField
          control={control}
          name="metadata.expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Type</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Amount - only show for receipts/expenses */}
      {(watchIsExpense || isReceiptUpload) && (
        <FormField
          control={control}
          name="metadata.amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field} 
                  value={field.value || prefillData?.amount || ''} 
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Date (for expenses) */}
      {(watchIsExpense || isReceiptUpload) && (
        <FormField
          control={control}
          name="metadata.expenseDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expense Date</FormLabel>
              <DatePicker
                date={field.value}
                setDate={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {/* Vendor Selector - only show when needed */}
      {showVendorSelector && (
        <>
          <Separator />
          <VendorSelector 
            form={form} 
            prefillVendorId={prefillData?.vendorId}
          />
        </>
      )}
      
      {/* Tags */}
      <FormField
        control={control}
        name="metadata.tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags (comma separated)</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter tags, separated by commas"
                value={field.value?.join(', ') || ''}
                onChange={(e) => {
                  const tagsString = e.target.value;
                  const tagsArray = tagsString
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0);
                  field.onChange(tagsArray);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Notes */}
      <FormField
        control={control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes about this document"
                {...field}
                value={field.value || ''}
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
