import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import AddressAutocomplete from '@/components/common/AddressAutocomplete';

interface LocationFieldsProps {
  selectedCustomerAddress?: string | null;
}

const LocationFields: React.FC<LocationFieldsProps> = ({ selectedCustomerAddress }) => {
  const form = useFormContext<EstimateFormValues>();
  
  // Ensure California is set as the default state
  React.useEffect(() => {
    const currentState = form.getValues('location.state');
    if (!currentState) {
      form.setValue('location.state', 'California');
    }
  }, [form]);
  
  const handleAddressSelect = (addressData: {
    fullAddress: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  }) => {
    // Update form values with the selected address data
    if (addressData.street) {
      form.setValue('location.address', addressData.street);
    }
    
    if (addressData.city) {
      form.setValue('location.city', addressData.city);
    }
    
    // Only set state if it's available and we're allowing state changes
    if (addressData.state) {
      // We'll keep California as the fixed state, but log what was selected
      console.log(`Google provided state: ${addressData.state}`);
    }
    
    if (addressData.zip) {
      form.setValue('location.zip', addressData.zip);
    }
  };
  
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
                <AddressAutocomplete 
                  placeholder="Enter street address" 
                  {...field} 
                  onAddressSelect={handleAddressSelect}
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
                <Input 
                  placeholder="State" 
                  {...field} 
                  defaultValue="California"
                  value={field.value || "California"}
                  readOnly
                  className="bg-gray-50"
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
