
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues, EstimateItem } from '../../schemas/estimateFormSchema';

const ContingencyInput = () => {
  const form = useFormContext<EstimateFormValues>();
  
  const items = form.watch('items') || [];
  
  // Calculate subtotal (for display only)
  const subtotal = items.reduce((sum: number, item: EstimateItem) => {
    const cost = parseFloat(item.cost || '0');
    const markup = parseFloat(item.markup_percentage || '0');
    const markupAmount = cost * (markup / 100);
    const quantity = parseFloat(item.quantity || '1');
    return sum + ((cost + markupAmount) * quantity);
  }, 0);
  
  // Format contingency amount display
  const contingencyPercentage = parseFloat(form.watch('contingency_percentage') || '0');
  const contingencyAmount = subtotal * (contingencyPercentage / 100);
  
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
