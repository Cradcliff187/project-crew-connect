
import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ExpenseTypeSelectorProps {
  index: number;
}

const ExpenseTypeSelector: React.FC<ExpenseTypeSelectorProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const expenseType = form.watch(`items.${index}.expense_type`);
  
  // Show custom input for "other" expense type
  useEffect(() => {
    if (expenseType === 'other') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      // Clear custom type if a specific expense type is selected
      form.setValue(`items.${index}.custom_type`, '');
    }
  }, [expenseType, form, index]);
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.expense_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expense Type</FormLabel>
            <Select value={field.value || ''} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="materials">Materials</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {showCustomInput && (
        <FormField
          control={form.control}
          name={`items.${index}.custom_type`}
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Custom Expense Type</FormLabel>
              <FormControl>
                <Input placeholder="Enter custom expense type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ExpenseTypeSelector;
