
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemDescriptionProps {
  control: Control<EstimateFormValues>;
  index: number;
}

const ItemDescription = ({ control, index }: ItemDescriptionProps) => {
  return (
    <div className="col-span-12 mb-2">
      <FormField
        control={control}
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
