
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface NotesFieldProps {
  control: Control<DocumentUploadFormValues>;
  prefillText?: string;
  instanceId?: string; // Added instanceId prop
}

const NotesField: React.FC<NotesFieldProps> = ({ 
  control, 
  prefillText,
  instanceId = 'default-notes'  // Default value
}) => {
  return (
    <FormField
      control={control}
      name="metadata.notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              id={`${instanceId}-notes-textarea`}
              placeholder="Add any notes or additional information about this document"
              className="resize-none"
              value={field.value || prefillText || ''}
            />
          </FormControl>
          <FormDescription>
            Include any relevant details that will help identify this document later
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
