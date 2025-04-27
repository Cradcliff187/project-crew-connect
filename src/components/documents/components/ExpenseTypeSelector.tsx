import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { EXPENSE_TYPES, ExpenseType } from '@/constants/expenseTypes';

interface ExpenseTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
}

const ExpenseTypeSelector: React.FC<ExpenseTypeSelectorProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="metadata.expenseType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Expense Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value || 'none'}
            value={field.value || 'none'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choose expense category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Choose expense category</SelectItem>
              {EXPENSE_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ExpenseTypeSelector;
