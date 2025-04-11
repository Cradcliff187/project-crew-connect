
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface ExpenseDatePickerProps {
  control: Control<DocumentUploadFormValues>;
  defaultDate?: Date;
}

const ExpenseDatePicker: React.FC<ExpenseDatePickerProps> = ({
  control,
  defaultDate = new Date()
}) => {
  return (
    <FormField
      control={control}
      name="metadata.expenseDate"
      render={({ field }) => (
        <FormItem className="flex flex-col w-full">
          <FormLabel className="font-medium text-slate-700">Date</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    field.value instanceof Date ?
                      format(field.value, "PPP") :
                      format(new Date(field.value), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value instanceof Date ? field.value : new Date(field.value || defaultDate)}
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
