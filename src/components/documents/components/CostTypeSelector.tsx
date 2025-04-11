
import React from 'react';
import { Control, useController } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DocumentUploadFormValues } from '../schemas/documentSchema';
import { expenseTypes } from '../utils/expenseTypes';

interface CostTypeSelectorProps {
  control: Control<DocumentUploadFormValues>;
}

const CostTypeSelector: React.FC<CostTypeSelectorProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="metadata.expenseType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cost Type</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select cost type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {expenseTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
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

export default CostTypeSelector;
