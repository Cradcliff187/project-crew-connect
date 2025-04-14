import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface TitleNumberFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const TitleNumberFields = ({ form }: TitleNumberFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">
              Title <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter work order title" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="work_order_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Work Order Number</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter work order number" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TitleNumberFields;
