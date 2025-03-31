
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const isUpdatingRef = useRef(false);
  
  // Load initial values from form
  useEffect(() => {
    if (isUpdatingRef.current) return;
    
    const currentValue = form.getValues(`items.${index}.expense_type`);
    if (currentValue && currentValue !== internalValue) {
      setInternalValue(currentValue);
      setShowCustomInput(currentValue === 'other');
    }
  }, [form, index, internalValue]);
  
  // Use a stable callback for expense type change
  const handleExpenseTypeChange = useCallback((value: string) => {
    try {
      isUpdatingRef.current = true;
      
      // Update internal state
      setInternalValue(value);
      
      // Update form state with minimal validation
      form.setValue(`items.${index}.expense_type`, value, {
        shouldDirty: true,
        shouldValidate: false
      });
      
      // Update custom input visibility
      setShowCustomInput(value === 'other');
      
      // If switching away from "other", clear the custom type
      if (value !== 'other') {
        form.setValue(`items.${index}.custom_type`, '', { shouldDirty: false });
      }
    } finally {
      isUpdatingRef.current = false;
    }
  }, [form, index]);
  
  // Handle custom type changes with minimal form updates
  const handleCustomTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUpdatingRef.current) return;
    
    try {
      isUpdatingRef.current = true;
      form.setValue(`items.${index}.custom_type`, e.target.value, {
        shouldDirty: true,
        shouldValidate: false
      });
    } finally {
      isUpdatingRef.current = false;
    }
  }, [form, index]);
  
  return (
    <div className="col-span-12 md:col-span-3">
      <FormField
        control={form.control}
        name={`items.${index}.expense_type`}
        render={() => (
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

export default React.memo(ExpenseTypeSelector);
