
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface NotesFieldProps {
  control: Control<any>;
  label?: string;
  name?: string;
  placeholder?: string;
}

const NotesField: React.FC<NotesFieldProps> = ({ 
  control, 
  label = 'Notes', 
  name = 'notes',
  placeholder = 'Add any relevant details about this time entry...'
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none h-24"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
