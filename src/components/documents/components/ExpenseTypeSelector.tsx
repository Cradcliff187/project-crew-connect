
import React, { useCallback } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, expenseTypes } from '../schemas/documentSchema';

interface ExpenseTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
  instanceId?: string;
}

const ExpenseTypeSelector: React.FC<ExpenseTypeSelectorProps> = ({ 
  control,
  instanceId = 'default-expense-type'
}) => {
  // Create a sanitized instanceId to ensure it's valid for DOM IDs
  const sanitizedInstanceId = instanceId.replace(/[^a-zA-Z0-9-]/g, '-');
  
  // Memoize the rendering of radio options for better performance
  const renderRadioOptions = useCallback(() => {
    return expenseTypes.map((type) => {
      const radioId = `${sanitizedInstanceId}-expense-type-${type}`;
      return (
        <div key={type} className="flex items-center space-x-2">
          <RadioGroupItem value={type} id={radioId} />
          <label 
            htmlFor={radioId} 
            className="text-sm font-normal cursor-pointer"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
        </div>
      );
    });
  }, [sanitizedInstanceId]);
  
  return (
    <FormField
      control={control}
      name="metadata.expenseType"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel>Expense Type</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap gap-4"
            >
              {renderRadioOptions()}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default React.memo(ExpenseTypeSelector);
