
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

/**
 * Hook for handling creation of new locations
 */
export const useLocationCreate = () => {
  /**
   * Creates a new location if a custom address is used
   * @param values The form values from the work order form
   * @returns The location ID (either new or existing)
   */
  const createLocationIfNeeded = async (values: WorkOrderFormValues): Promise<string | null> => {
    // If not using custom address, just return the selected location ID
    if (!values.use_custom_address) {
      return values.location_id;
    }
    
    // If using custom address but address is missing, return null
    if (!values.address) {
      return null;
    }

    try {
      // Insert a new location and get the ID
      const { data: newLocation, error: locationError } = await supabase
        .from('site_locations')
        .insert({
          location_name: `${values.address}, ${values.city || ''} ${values.state || ''} ${values.zip || ''}`.trim(),
          address: values.address,
          city: values.city,
          state: values.state,
          zip: values.zip,
          customer_id: values.customer_id || null,
          is_active: true
        })
        .select('location_id')
        .single();
      
      if (locationError) {
        throw locationError;
      }
      
      return newLocation?.location_id || null;
    } catch (error) {
      console.error('Error creating new location:', error);
      throw error;
    }
  };

  return {
    createLocationIfNeeded
  };
};
