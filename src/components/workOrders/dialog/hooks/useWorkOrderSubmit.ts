import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';
import { useLocationCreate } from './useLocationCreate';
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

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
          // calendar_sync_enabled: true, // Field exists in DB but not in types yet
          // calendar_event_id: null, // Field exists in DB but not in types yet
        })
        .select();

      if (error) {
        throw error;
      }

      // Automatically create calendar event for work orders with scheduled dates
      if (scheduledDate && workOrder && workOrder.length > 0) {
        const workOrderId = workOrder[0].work_order_id;

        try {
          // Use intelligent calendar service for automatic work order calendar integration
          const calendarResult = await EnhancedCalendarService.createEvent({
            title: values.title,
            description: values.description || '',
            startTime: scheduledDate,
            endTime: dueByDate || undefined,
            location: '', // Could potentially fetch and format location details
            entityType: 'work_order',
            entityId: workOrderId,
            assignees: values.assigned_to
              ? [
                  {
                    type: 'employee', // Assume employee for now - could be enhanced to detect type
                    id: values.assigned_to,
                    email: undefined, // Will be fetched automatically by EnhancedCalendarService
                  },
                ]
              : [],
            userEmail: 'current-user@example.com', // TODO: Get from auth context
            sendNotifications: true,
          });

          // Log calendar result for debugging (since we can't store event ID yet)
          if (calendarResult.success && calendarResult.primaryEventId) {
            console.log('Calendar event created successfully:', {
              workOrderId,
              eventId: calendarResult.primaryEventId,
              calendar: calendarResult.calendarSelection?.primaryCalendar.name,
              invitesSent: calendarResult.invitesSent?.length || 0,
            });

            // Show success message with calendar details
            toast({
              title: 'Work Order Created',
              description: `Work order created and added to ${calendarResult.calendarSelection?.primaryCalendar.name}. ${calendarResult.invitesSent?.length || 0} invite(s) sent.`,
            });
          } else {
            // Work order created but calendar sync failed
            console.warn('Calendar sync failed:', calendarResult.errors);
            toast({
              title: 'Work Order Created',
              description: 'Work order created successfully, but calendar sync failed.',
            });
          }
        } catch (calendarError) {
          // Log calendar error but don't fail the work order creation
          console.error('Calendar integration error:', calendarError);
          toast({
            title: 'Work Order Created',
            description: 'Work order created successfully, but calendar sync failed.',
          });
        }
      } else {
        // Work order created without scheduled date
        toast({
          title: 'Work Order Created',
          description: 'The work order has been created successfully.',
        });
      }

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
