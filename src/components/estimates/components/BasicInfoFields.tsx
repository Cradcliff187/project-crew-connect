
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

interface BasicInfoFieldsProps {
  customers: { id: string; name: string; address?: string; city?: string; state?: string; zip?: string }[];
  handleCustomerChange: (customerId: string) => void;
}

const BasicInfoFields = ({ customers, handleCustomerChange }: BasicInfoFieldsProps) => {
  const form = useFormContext<EstimateFormValues>();
  
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-montserrat font-semibold mb-4 text-[#333333]">Project Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="project"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-medium">Project Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-medium">Customer*</FormLabel>
              <Select 
                onValueChange={handleCustomerChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default BasicInfoFields;
