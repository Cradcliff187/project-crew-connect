import React from 'react';
import { Control } from 'react-hook-form';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentUploadFormValues, ExpenseType } from './schemas/documentSchema';

interface ExpenseFormProps {
  control: Control<DocumentUploadFormValues>;
  isReceiptUpload?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ control, isReceiptUpload = false }) => {
  return (
    <div className="space-y-4 border rounded-md p-4 bg-gray-50">
      <h3 className="text-sm font-medium">Expense Details</h3>

      <FormField
        control={control}
        name="metadata.amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  {...field}
                  value={field.value || ''}
                  onChange={e => {
                    const value = e.target.value;
                    // Only allow numbers and decimal points
                    if (/^(\d*\.)?\d*$/.test(value)) {
                      field.onChange(value === '' ? undefined : parseFloat(value));
                    }
                  }}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isReceiptUpload && (
        <FormField
          control={control}
          name="metadata.expenseType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Type</FormLabel>
              <FormControl>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={field.value}
                  onChange={field.onChange}
                >
                  {['materials', 'equipment', 'supplies', 'other'].map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="metadata.expenseDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Expense Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={'outline'}
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
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  disabled={date => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

// Add this to fix the Button import error
import { Button } from '@/components/ui/button';

export default ExpenseForm;
