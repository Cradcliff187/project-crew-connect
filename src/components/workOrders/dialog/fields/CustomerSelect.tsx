
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface CustomerSelectProps {
  form: UseFormReturn<WorkOrderFormValues>;
  customers: { customerid: string; customername: string }[];
}

const CustomerSelect = ({ form, customers }: CustomerSelectProps) => {
  const [customerData, setCustomerData] = useState<Array<{ customerid: string; customername: string }>>([]);
  
  useEffect(() => {
    if (customers && customers.length > 0) {
      setCustomerData([...customers]);
    }
  }, [customers]);
  
  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          <Select 
            onValueChange={(value) => {
              console.log('Selected customer value:', value);
              field.onChange(value);
            }}
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="bg-white z-[1000]"
              sideOffset={4}
            >
              {customerData && customerData.length > 0 ? (
                customerData.map((customer) => (
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
