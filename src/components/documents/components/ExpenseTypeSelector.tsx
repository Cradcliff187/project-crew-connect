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

// Define expense type options
export const expenseTypes = [
  { value: 'material', label: 'Material' },
  { value: 'tools', label: 'Tools & Equipment' },
  { value: 'labor', label: 'Labor' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'permit', label: 'Permit Fees' },
  { value: 'travel', label: 'Travel & Transportation' },
  { value: 'office', label: 'Office Expense' },
  { value: 'utility', label: 'Utilities' },
  { value: 'other', label: 'Other' },
] as const;

// Type for expense type values
export type ExpenseType = (typeof expenseTypes)[number]['value'];

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
          <Select onValueChange={field.onChange} defaultValue={field.value || 'material'}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {expenseTypes.map(type => (
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
