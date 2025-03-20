
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface UseWorkOrderSubmitProps {
  onWorkOrderAdded: () => void;
  onOpenChange: (open: boolean) => void;
  resetForm: () => void;
}

export const useWorkOrderSubmit = ({ 
  onWorkOrderAdded, 
  onOpenChange, 
  resetForm 
}: UseWorkOrderSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // First handle creating a new location if custom address is used
      let locationId = values.location_id;

      if (values.use_custom_address && values.address) {
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
        
        if (newLocation) {
          locationId = newLocation.location_id;
        }
      }

      // Now create the work order with either the selected or newly created location
      const { error } = await supabase
        .from('maintenance_work_orders')
        .insert({
          title: values.title,
          description: values.description,
          priority: values.priority,
          po_number: values.po_number,
          time_estimate: values.time_estimate,
          scheduled_date: values.scheduled_date ? values.scheduled_date.toISOString() : null,
          customer_id: values.customer_id || null,
          location_id: locationId || null,
          assigned_to: values.assigned_to || null,
          status: 'NEW',
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Work Order Created',
        description: 'The work order has been created successfully.',
      });
      
      onWorkOrderAdded();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error Creating Work Order',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    onSubmit
  };
};
