
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';

interface LocationFieldsProps {
  selectedCustomerAddress?: string | null;
}

const LocationFields: React.FC<LocationFieldsProps> = ({ selectedCustomerAddress }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Set default state if none is provided
  React.useEffect(() => {
    const currentState = form.getValues('location.state');
    if (!currentState) {
      form.setValue('location.state', 'California');
    }
  }, [form]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mt-8 mb-4">Project Location</h3>
      
      {selectedCustomerAddress && (
        <div className="p-3 bg-gray-50 rounded-md border mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Customer Address:</span> {selectedCustomerAddress}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            You can use the customer address or specify a different location below.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="Street address" {...field} />
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
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="location.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="State" {...field} />
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
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input placeholder="Zip code" {...field} />
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
