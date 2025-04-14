import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface CustomerSelectProps {
  form: UseFormReturn<WorkOrderFormValues>;
  customers: { customerid: string; customername: string }[];
}

const CustomerSelect = ({ form, customers }: CustomerSelectProps) => {
  const hasCustomers = customers && customers.length > 0;

  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''} disabled={!hasCustomers}>
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-white z-[1000]" position="popper" sideOffset={4}>
              {hasCustomers ? (
                customers.map(customer => (
                  <SelectItem
                    key={customer.customerid}
                    value={customer.customerid}
                    className="cursor-pointer hover:bg-gray-100 py-2 px-4"
                  >
                    {customer.customername || 'Unnamed Customer'}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-customers" disabled className="text-gray-500">
                  No customers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomerSelect;
