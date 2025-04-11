
import React from 'react';
import { 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface CostInputProps {
  index: number;
}

const CostInput: React.FC<CostInputProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  
  const updatePrice = (cost: string, markupPercentage: string) => {
    const costValue = parseFloat(cost) || 0;
    const markupPercent = parseFloat(markupPercentage) || 0;
    const markupAmount = costValue * (markupPercent / 100);
    const unitPrice = costValue + markupAmount;
    
    form.setValue(`items.${index}.unit_price`, unitPrice.toString(), {
      shouldDirty: true,
      shouldValidate: false
    });
  };
  
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCost = e.target.value;
    const currentMarkup = form.getValues(`items.${index}.markup_percentage`) || '0';
    
    updatePrice(newCost, currentMarkup);
  };
  
  return (
    <div className="col-span-6 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.cost`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cost</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="0.00"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  handleCostChange(e);
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

export default CostInput;
