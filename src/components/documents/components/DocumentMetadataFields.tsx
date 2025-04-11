
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface DocumentMetadataFieldsProps {
  control: Control<DocumentUploadFormValues>;
  isExpense: boolean;
  materialName?: string;
  expenseName?: string;
}

const DocumentMetadataFields: React.FC<DocumentMetadataFieldsProps> = ({ 
  control, 
  isExpense,
  materialName,
  expenseName
}) => {
  // Generate notes placeholder based on context
  const getNotesPlaceholder = () => {
    if (isExpense) {
      if (materialName) {
        return `Receipt for ${materialName}`;
      }
      if (expenseName) {
        return `Receipt for ${expenseName}`;
      }
      return 'Enter details about this receipt...';
    }
    return 'Enter any notes about this document...';
  };

  return (
    <FormField
      control={control}
      name="metadata.notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea
              placeholder={getNotesPlaceholder()}
              className="resize-none"
              {...field}
              rows={3}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DocumentMetadataFields;
