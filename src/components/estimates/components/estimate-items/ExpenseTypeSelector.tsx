
import React, { useEffect, useState, useCallback, memo } from 'react';
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
  const [internalValue, setInternalValue] = useState('');
  
  // Use a callback for the expense type change handler to prevent recreation on render
  const handleExpenseTypeChange = useCallback((value: string) => {
    // Set internal state first to avoid re-renders from form
    setInternalValue(value);
    
    // Update form with minimal validation and re-rendering
    form.setValue(`items.${index}.expense_type`, value, {
      shouldDirty: true,
      shouldValidate: false, 
      shouldTouch: true
    });
    
    // Toggle custom input separately from form updates
    setShowCustomInput(value === 'other');
    
    // If switching away from "other", clear the custom type
    if (value !== 'other') {
      form.setValue(`items.${index}.custom_type`, '', { shouldDirty: false });
    }
  }, [form, index]);
  
  // Use a stable callback for custom type changes
  const handleCustomTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue(`items.${index}.custom_type`, e.target.value, {
      shouldDirty: true,
      shouldValidate: false
    });
  }, [form, index]);
  
  // Initialize component state from form values
  useEffect(() => {
    const currentValue = form.getValues(`items.${index}.expense_type`);
    if (currentValue) {
      setInternalValue(currentValue);
      setShowCustomInput(currentValue === 'other');
    }
  }, [form, index]);
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.expense_type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Expense Type</FormLabel>
            <Select 
              value={internalValue || 'none'} 
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
                  onChange={handleCustomTypeChange}
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

// Use React.memo to prevent unnecessary re-renders
export default memo(ExpenseTypeSelector);
