
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

export const useLocationCreate = () => {
  const createLocationIfNeeded = async (values: WorkOrderFormValues): Promise<string | null> => {
    // If useCustomAddress is true, we need to create a new location
    if (values.useCustomAddress) {
      try {
        // Check if we have the required address fields
        if (!values.address || !values.city || !values.state || !values.zip) {
          throw new Error('Please provide all address details for the new location.');
        }
        
        // Create a location name from the address if not provided
        const locationName = `${values.address}, ${values.city}, ${values.state} ${values.zip}`;
        
        // Insert the new location
        const { data, error } = await supabase
          .from('site_locations')
          .insert({
            location_name: locationName,
            address: values.address,
            city: values.city,
            state: values.state,
            zip: values.zip,
            customer_id: values.customer_id || null
          })
          .select('location_id')
          .single();
        
        if (error) {
          throw error;
        }
        
        // Return the newly created location ID
        return data?.location_id || null;
      } catch (error) {
        console.error('Error creating location:', error);
        throw error;
      }
    }
    
    // If useCustomAddress is false, just use the selected location
    return values.location_id || null;
  };

  return { createLocationIfNeeded };
};
