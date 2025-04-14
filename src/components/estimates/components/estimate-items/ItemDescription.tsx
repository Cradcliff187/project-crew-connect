import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemDescriptionProps {
  index: number;
}

const ItemDescription: React.FC<ItemDescriptionProps> = ({ index }) => {
  const form = useFormContext<EstimateFormValues>();

  return (
    <div className="col-span-12 mb-2">
      <FormField
        control={form.control}
        name={`items.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description*</FormLabel>
            <FormControl>
              <Input placeholder="Enter item description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ItemDescription;
