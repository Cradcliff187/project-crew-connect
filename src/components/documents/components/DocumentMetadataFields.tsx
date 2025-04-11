
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';

interface DocumentMetadataFieldsProps {
  control: Control<any>;
  isExpense?: boolean;
  materialName?: string;
  expenseName?: string;
}

const DocumentMetadataFields: React.FC<DocumentMetadataFieldsProps> = ({
  control,
  isExpense = false,
  materialName,
  expenseName
}) => {
  // Create a default note based on available information
  const getDefaultNote = () => {
    if (materialName) {
      return `Receipt for ${materialName}`;
    }
    if (expenseName) {
      return `Receipt for ${expenseName}`;
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="metadata.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Add details about this document"
                className="resize-none"
                {...field}
                defaultValue={field.value || getDefaultNote()}
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
              <FormLabel>Mark as Expense Receipt</FormLabel>
              <div className="text-sm text-muted-foreground">
                Enable expense tracking features
              </div>
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
    </div>
  );
};

export default DocumentMetadataFields;
