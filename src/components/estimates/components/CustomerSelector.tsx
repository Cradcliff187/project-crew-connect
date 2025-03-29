
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

interface CustomerSelectorProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string; }[];
  selectedCustomerAddress: string | null;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({ 
  customers,
  selectedCustomerAddress
}) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="customer"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a customer</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedCustomerAddress && (
        <div className="text-sm text-muted-foreground">
          {selectedCustomerAddress}
        </div>
      )}
    </div>
  );
};

export default CustomerSelector;
