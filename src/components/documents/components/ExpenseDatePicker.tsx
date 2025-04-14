import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

interface ExpenseDatePickerProps {
  control: Control<DocumentUploadFormValues>;
}

const ExpenseDatePicker: React.FC<ExpenseDatePickerProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="metadata.expenseDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ExpenseDatePicker;
