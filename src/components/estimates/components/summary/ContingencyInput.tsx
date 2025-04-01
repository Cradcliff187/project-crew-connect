
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

const ContingencyInput = () => {
  const form = useFormContext<EstimateFormValues>();
  
  // Calculate contingency amount based on current items
  const items = form.watch('items') || [];
  const totalBeforeContingency = items.reduce((sum: number, item: any) => {
    const cost = parseFloat(item.cost) || 0;
    const markup = parseFloat(item.markup_percentage) || 0;
    const markupAmount = cost * (markup / 100);
    const quantity = parseFloat(item.quantity) || 1;
    return sum + ((cost + markupAmount) * quantity);
  }, 0);
  
  const contingencyPercentage = parseFloat(form.watch('contingency_percentage') || '0');
  const contingencyAmount = (totalBeforeContingency * contingencyPercentage) / 100;

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <FormField
          control={form.control}
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

export default ContingencyInput;
