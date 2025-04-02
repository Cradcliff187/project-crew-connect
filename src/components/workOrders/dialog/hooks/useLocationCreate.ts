
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

export const useLocationCreate = () => {
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Creates a new location if needed based on form data
   * @returns The location_id of either the selected or newly created location
   */
  const createLocationIfNeeded = async (values: WorkOrderFormValues): Promise<string | null> => {
    // If using an existing location, just return the selected ID
    if (values.location_id) {
      return values.location_id;
    }
    
    // If no address data is provided, return null (no location)
    if (!values.address && !values.city && !values.state && !values.zip) {
      return null;
    }
    
    setIsCreating(true);
    
    try {
      console.log('Creating new location with data:', {
        address: values.address,
        city: values.city,
        state: values.state || 'California', // Fallback to California
        zip: values.zip,
        customer_id: values.customer_id
      });
      
      // Create a location name based on address or customer
      const locationName = values.address 
        ? `${values.address}, ${values.city || ''}`
        : `Location for WO: ${new Date().toISOString().substring(0, 10)}`;
      
      // Insert new location
      const { data, error } = await supabase
        .from('site_locations')
        .insert({
          location_name: locationName,
          address: values.address,
          city: values.city,
          state: values.state || 'California', // Ensure state has a default
          zip: values.zip,
          customer_id: values.customer_id
        })
        .select('location_id')
        .single();
      
      if (error) {
        throw error;
      }
      
      console.log('Created new location:', data);
      return data.location_id;
    } catch (error: any) {
      console.error('Error creating location:', error);
      toast({
        title: 'Error creating location',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createLocationIfNeeded
  };
};
