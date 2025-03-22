
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface MarkupInputProps {
  index: number;
}

const MarkupInput: React.FC<MarkupInputProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="col-span-6 md:col-span-2">
      <FormField
        control={form.control}
        name={`items.${index}.markup_percentage`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Markup %</FormLabel>
            <FormControl>
              <Input placeholder="0" type="number" step="0.1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MarkupInput;
