
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface CustomLocationFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const CustomLocationFields = ({ form }: CustomLocationFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter address" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter city" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter state" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter ZIP code" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default CustomLocationFields;
