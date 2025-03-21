
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

const LocationFields = () => {
  const form = useFormContext<EstimateFormValues>();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-medium">Street Address</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter job site address" 
                  {...field} 
                  className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-medium">City</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter city" 
                  {...field} 
                  className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-medium">State</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter state" 
                  {...field} 
                  className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location.zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#333333] font-medium">ZIP Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter ZIP code" 
                  {...field} 
                  className="border-gray-300 focus:border-[#0485ea] focus:ring-[#0485ea]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default LocationFields;
