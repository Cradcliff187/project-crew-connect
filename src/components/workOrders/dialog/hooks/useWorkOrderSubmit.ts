
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';
import { useLocationCreate } from './useLocationCreate';

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
  const { createLocationIfNeeded } = useLocationCreate();

  const onSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Use our new hook to handle location creation
      const locationId = await createLocationIfNeeded(values);

      // Handle date values properly - ensure they are actual Date objects before calling toISOString
      const scheduledDate = values.scheduled_date 
        ? (values.scheduled_date instanceof Date 
            ? values.scheduled_date.toISOString() 
            : values.scheduled_date)
        : null;
      
      const dueByDate = values.due_by_date
        ? (values.due_by_date instanceof Date 
            ? values.due_by_date.toISOString() 
            : values.due_by_date)
        : null;

      // Create the work order with either the selected or newly created location
      const { error } = await supabase
        .from('maintenance_work_orders')
        .insert({
          title: values.title,
          work_order_number: values.work_order_number,
          description: values.description,
          priority: values.priority,
          po_number: values.po_number,
          time_estimate: values.time_estimate,
          scheduled_date: scheduledDate,
          due_by_date: dueByDate,
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
