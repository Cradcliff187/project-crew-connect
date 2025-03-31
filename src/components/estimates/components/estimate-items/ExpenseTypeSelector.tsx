
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
  
  // Use a standard watch to minimize re-renders
  const expenseType = form.watch(`items.${index}.expense_type`);
  
  // Only update UI state when expense type changes, don't trigger form updates
  useEffect(() => {
    if (expenseType === 'other') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      
      // Only clear custom_type if it has been set previously
      const currentCustomType = form.getValues(`items.${index}.custom_type`);
      if (currentCustomType) {
        form.setValue(`items.${index}.custom_type`, '', { shouldDirty: false });
      }
    }
  }, [expenseType, form, index]);
  
  // Separate rendering from form interactions
  const handleExpenseTypeChange = (value: string) => {
    form.setValue(`items.${index}.expense_type`, value, {
      shouldDirty: true,
      shouldValidate: false, // Avoid triggering validation on every change
      shouldTouch: true
    });
  };
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.expense_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expense Type</FormLabel>
            <Select 
              value={field.value || 'none'} 
              onValueChange={handleExpenseTypeChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Select expense type</SelectItem>
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
                <Input 
                  placeholder="Enter custom expense type" 
                  {...field} 
                  onBlur={(e) => {
                    // Only update on blur to reduce re-renders
                    field.onBlur();
                  }}
                  onChange={(e) => {
                    // Update with minimal render impact
                    field.onChange(e);
                  }}
                />
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
