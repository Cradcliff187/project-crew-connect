
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface NotesFieldProps {
  control: Control<any>;
}

const NotesField: React.FC<NotesFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes (Optional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Add any notes about this time entry..."
              {...field}
              value={field.value || ''}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default NotesField;
