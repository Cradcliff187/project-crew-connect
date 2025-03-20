
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface CreateLocationToggleProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const CreateLocationToggle = ({ form }: CreateLocationToggleProps) => {
  return (
    <FormField
      control={form.control}
      name="use_custom_address"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between space-y-0 pt-7">
          <FormLabel>Create New Location</FormLabel>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default CreateLocationToggle;
