
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface CostFieldsProps {
  control: Control<EstimateFormValues>;
  index: number;
}

const CostFields = ({ control, index }: CostFieldsProps) => {
  return (
    <>
      <div className="col-span-6 md:col-span-3">
        <FormField
          control={control}
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

      <div className="col-span-6 md:col-span-3">
        <FormField
          control={control}
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
    </>
  );
};

export default CostFields;
