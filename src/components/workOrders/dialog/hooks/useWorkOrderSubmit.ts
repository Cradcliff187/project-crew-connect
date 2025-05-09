import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';
import { useLocationCreate } from './useLocationCreate';
import { useCalendarIntegration } from '@/hooks/useCalendarIntegration';

interface UseWorkOrderSubmitProps {
  onWorkOrderAdded: () => void;
  onOpenChange: (open: boolean) => void;
  resetForm: () => void;
}

export const useWorkOrderSubmit = ({
  onWorkOrderAdded,
  onOpenChange,
  resetForm,
}: UseWorkOrderSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createLocationIfNeeded } = useLocationCreate();
  const { createEvent } = useCalendarIntegration();

  const onSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);

    try {
      // Use our new hook to handle location creation
      const locationId = await createLocationIfNeeded(values);

      // Handle date values properly - ensure they are actual Date objects before calling toISOString
      const scheduledDate = values.scheduled_date
        ? values.scheduled_date instanceof Date
          ? values.scheduled_date.toISOString()
          : values.scheduled_date
        : null;

      const dueByDate = values.due_by_date
        ? values.due_by_date instanceof Date
          ? values.due_by_date.toISOString()
          : values.due_by_date
        : null;

      // Create the work order with either the selected or newly created location
      const { data: workOrder, error } = await supabase
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
          calendar_sync_enabled: values.calendar_sync_enabled || false,
          calendar_event_id: null, // Will be updated after calendar event is created
        })
        .select();

      if (error) {
        throw error;
      }

      // Create calendar event if calendar sync is enabled and a scheduled date is set
      if (values.calendar_sync_enabled && scheduledDate && workOrder && workOrder.length > 0) {
        const workOrderId = workOrder[0].work_order_id;

        // Create calendar event
        const calendarResult = await createEvent({
          title: values.title,
          description: values.description || '',
          startTime: scheduledDate,
          endTime: dueByDate || undefined,
          location: '', // Could potentially fetch and format location details
          entityType: 'work_order',
          entityId: workOrderId,
        });

        // If event was created successfully, update the work order with the event ID
        if (calendarResult.success && calendarResult.eventId) {
          await supabase
            .from('maintenance_work_orders')
            .update({
              calendar_event_id: calendarResult.eventId,
            })
            .eq('work_order_id', workOrderId);
        }
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
    onSubmit,
  };
};
