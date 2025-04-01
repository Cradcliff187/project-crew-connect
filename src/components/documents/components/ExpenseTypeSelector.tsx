
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { DocumentUploadFormValues, expenseTypes } from '../schemas/documentSchema';

interface ExpenseTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
}

// Component for use within a form with react-hook-form
const ExpenseTypeSelector: React.FC<ExpenseTypeSelectorProps> = ({ control }) => {
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
              {expenseTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`expense-type-${type}`} />
                  <label 
                    htmlFor={`expense-type-${type}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ExpenseTypeSelector;
