import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface MarkupInputProps {
  index: number;
}

const MarkupInput: React.FC<MarkupInputProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();

  const updatePrice = (cost: string, markupPercentage: string) => {
    const costValue = parseFloat(cost) || 0;
    const markupPercent = parseFloat(markupPercentage) || 0;
    const markupAmount = costValue * (markupPercent / 100);
    const unitPrice = costValue + markupAmount;

    form.setValue(`items.${index}.unit_price`, unitPrice.toString(), {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  const handleMarkupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMarkup = e.target.value;
    const currentCost = form.getValues(`items.${index}.cost`) || '0';

    updatePrice(currentCost, newMarkup);
  };

  return (
    <div className="col-span-6 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.markup_percentage`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Markup %</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.00"
                {...field}
                onChange={e => {
                  field.onChange(e);
                  handleMarkupChange(e);
                }}
                className="text-right"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MarkupInput;
