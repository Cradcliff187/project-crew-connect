
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ContingencyFieldProps {
  control: Control<EstimateFormValues>;
  contingencyAmount: number;
}

const ContingencyField: React.FC<ContingencyFieldProps> = ({ control, contingencyAmount }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <FormField
          control={control}
          name="contingency_percentage"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormLabel className="text-sm text-gray-600 flex-shrink-0 m-0">
                Contingency:
              </FormLabel>
              <div className="flex items-center gap-1">
                <FormControl>
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    className="w-20 h-8"
                    {...field}
                  />
                </FormControl>
                <span>%</span>
              </div>
            </FormItem>
          )}
        />
      </div>
      <span className="font-medium">${contingencyAmount.toFixed(2)}</span>
    </div>
  );
};

export default ContingencyField;
