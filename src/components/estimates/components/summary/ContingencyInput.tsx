
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { useSummaryCalculations } from '../../hooks/useSummaryCalculations';

const ContingencyInput = () => {
  const form = useFormContext<EstimateFormValues>();
  const { contingencyAmount } = useSummaryCalculations();
  
  return (
    <div className="space-y-2">
      <FormField
        control={form.control}
        name="contingency_percentage"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between">
              <FormLabel>Contingency</FormLabel>
              {contingencyAmount > 0 && (
                <span className="text-sm text-muted-foreground">
                  ${contingencyAmount.toFixed(2)}
                </span>
              )}
            </div>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                  %
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContingencyInput;
