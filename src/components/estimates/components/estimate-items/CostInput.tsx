
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface CostInputProps {
  index: number;
}

const CostInput: React.FC<CostInputProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="col-span-6 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.cost`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cost*</FormLabel>
            <FormControl>
              <Input placeholder="0.00" type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CostInput;
