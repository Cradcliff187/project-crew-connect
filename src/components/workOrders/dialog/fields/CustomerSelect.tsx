
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
  const [isOpen, setIsOpen] = useState(false);
  const [customerData, setCustomerData] = useState<Array<{ customerid: string; customername: string }>>([]);
  
  useEffect(() => {
    console.log('Customer data changed in CustomerSelect component:', customers);
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
            onOpenChange={(open) => {
              console.log('Dropdown opened state:', open);
              console.log('Available customers when opening dropdown:', customerData);
              setIsOpen(open);
            }}
            open={isOpen}
          >
            <FormControl>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent 
              className="bg-white z-[100]" 
              position="popper"
              align="start"
              side="bottom"
              avoidCollisions={false}
            >
              {customerData && customerData.length > 0 ? (
                customerData.map((customer) => {
                  console.log('Rendering customer option:', customer);
                  return (
                    <SelectItem 
                      key={customer.customerid} 
                      value={customer.customerid}
                      className="cursor-pointer hover:bg-gray-100 py-2 px-4"
                    >
                      {customer.customername || 'Unnamed Customer'}
                    </SelectItem>
                  );
                })
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
