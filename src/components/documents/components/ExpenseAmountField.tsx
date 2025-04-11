
import React from 'react';
import { Control, useController } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface ExpenseAmountFieldProps {
  control: Control<DocumentUploadFormValues>;
  amount?: number;
}

const ExpenseAmountField: React.FC<ExpenseAmountFieldProps> = ({ control, amount }) => {
  const { field: amountField } = useController({
    name: 'metadata.amount',
    control,
  });

  // Format the amount as a currency string
  const formatAmount = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return '';
    return value.toString();
  };

  // Parse the string input into a number
  const parseAmount = (value: string): number => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    return parseFloat(cleanValue) || 0;
  };

  return (
    <FormField
      control={control}
      name="metadata.amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount ($)</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                $
              </span>
              <Input
                type="text"
                placeholder="0.00"
                className="pl-7"
                value={amountField.value !== undefined ? amountField.value : ''}
                onChange={(e) => {
                  const parsedValue = parseAmount(e.target.value);
                  amountField.onChange(parsedValue);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ExpenseAmountField;
