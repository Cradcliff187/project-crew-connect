
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface DescriptionFieldProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const DescriptionField = ({ form }: DescriptionFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-medium">Description</FormLabel>
          <FormControl>
            <Textarea 
              {...field}
              placeholder="Enter work order description" 
              rows={3}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;
