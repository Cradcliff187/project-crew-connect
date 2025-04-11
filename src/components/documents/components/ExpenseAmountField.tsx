
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';

interface ExpenseAmountFieldProps {
  control: Control<any>;
  amount?: number;
}

const ExpenseAmountField: React.FC<ExpenseAmountFieldProps> = ({ control, amount }) => {
  return (
    <FormField
      control={control}
      name="metadata.amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...field}
                defaultValue={amount || field.value}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
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
