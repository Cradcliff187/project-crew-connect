import { useState, useEffect } from 'react';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import UnifiedCalendarForm, { CalendarFormData } from '@/components/common/UnifiedCalendarForm';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService } from '@/services/googleCalendarService';
import { useToast } from '@/hooks/use-toast';
import { EventAttendee } from '@/types/unifiedCalendar';

interface WorkOrderCalendarFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderData: Partial<WorkOrderFormValues> | null;
  workOrderId?: string;
  projectId?: string;
  onSave: (workOrderData: Partial<WorkOrderFormValues>) => Promise<boolean>;
  onCancel: () => void;
}

const WorkOrderCalendarForm = ({
  open,
  onOpenChange,
  workOrderData,
  workOrderId = '',
  projectId,
  onSave,
  onCancel,
}: WorkOrderCalendarFormProps) => {
  const [assignedEmployees, setAssignedEmployees] = useState<EventAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch existing assignments if this is an existing work order
  useEffect(() => {
    if (workOrderId && open) {
      const fetchAssignments = async () => {
        try {
          setIsLoading(true);

          // Get assignments for this work order
          const { data: assignments, error } = await supabase.rpc('get_entity_assignments', {
            p_entity_type: 'work_order',
            p_entity_id: workOrderId,
          });

          if (error) throw error;

          if (assignments) {
            // Convert assignments to attendees
            const attendees: EventAttendee[] = assignments.map((assignment: any) => ({
              id: assignment.assignee_id,
              type: 'employee',
              name: assignment.assignee_name,
              email: assignment.assignee_email,
              rate: assignment.rate_per_hour,
              response_status: 'needsAction',
            }));

            setAssignedEmployees(attendees);
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
          toast({
            title: 'Error',
            description: 'Could not load assigned employees.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchAssignments();
    } else {
      // For new work orders, check if there's an assigned employee
      if (workOrderData?.assigned_to) {
        const fetchEmployee = async () => {
          try {
            setIsLoading(true);

            const { data: employee, error } = await supabase
              .from('employees')
              .select('employee_id, first_name, last_name, email, bill_rate')
              .eq('employee_id', workOrderData.assigned_to)
              .single();

            if (error) throw error;

            if (employee) {
              setAssignedEmployees([
                {
                  id: employee.employee_id,
                  type: 'employee',
                  name: `${employee.first_name} ${employee.last_name}`,
                  email: employee.email,
                  rate: employee.bill_rate,
                  response_status: 'needsAction',
                },
              ]);
            }
          } catch (error) {
            console.error('Error fetching employee:', error);
          } finally {
            setIsLoading(false);
          }
        };

        fetchEmployee();
      } else {
        setIsLoading(false);
      }
    }
  }, [workOrderId, workOrderData?.assigned_to, open, toast]);

  // Function to map work order data to calendar form data
  const mapToCalendarFormData = (): CalendarFormData => {
    // Format location from address fields if custom address is used
    let location = '';
    if (workOrderData?.useCustomAddress && workOrderData?.address) {
      const parts = [
        workOrderData.address,
        workOrderData.city,
        workOrderData.state,
        workOrderData.zip,
      ].filter(Boolean);
      location = parts.join(', ');
    }

    // Create a title that includes the work order number if available
    const title = workOrderData?.work_order_number
      ? `WO-${workOrderData.work_order_number} | ${workOrderData.title || ''}`
      : workOrderData?.title || '';

    // Build description with relevant work order details
    let description = workOrderData?.description || '';

    // Add priority and PO number if available
    if (workOrderData?.priority) {
      description = `Priority: ${workOrderData.priority}\n${description}`;
    }

    if (workOrderData?.po_number) {
      description = `${description}\nPO Number: ${workOrderData.po_number}`;
    }

    // Extended properties for the work order
    const extendedProperties: Record<string, string> = {
      woId: workOrderId || '',
    };

    if (projectId) {
      extendedProperties.projectId = projectId;
    }

    if (workOrderData?.priority) {
      extendedProperties.priority = workOrderData.priority;
    }

    // Make sure to handle dates properly
    const startDate = workOrderData?.scheduled_date ? new Date(workOrderData.scheduled_date) : null;

    const endDate = workOrderData?.due_by_date
      ? new Date(workOrderData.due_by_date)
      : startDate
        ? new Date(startDate)
        : null;

    return {
      title,
      description,
      startDate,
      endDate,
      isAllDay: true, // Work orders are typically all-day events
      location,
      attendees: assignedEmployees,
      notifyExternalAttendees: true,
      syncEnabled: workOrderData?.calendar_sync_enabled ?? true,
      entityType: 'work_order',
      entityId: workOrderId || 'new',
      extendedProperties,
    };
  };

  // Function to map calendar form data back to work order data
  const mapToWorkOrderData = async (formData: CalendarFormData): Promise<boolean> => {
    // Extract assigned employee from attendees
    const assignedEmployee = formData.attendees.find(a => a.type === 'employee');

    const workOrderUpdate: Partial<WorkOrderFormValues> = {
      ...workOrderData,
      title: formData.title.replace(/^WO-[^|]*\|\s*/, '').trim(), // Remove the work order prefix if present
      description: formData.description,
      scheduled_date: formData.startDate,
      due_by_date: formData.endDate,
      assigned_to: assignedEmployee?.id || workOrderData?.assigned_to,
      calendar_sync_enabled: formData.syncEnabled,
    };

    // Call the parent component's save function
    return await onSave(workOrderUpdate);
  };

  // Render nothing while loading to avoid flicker
  if (isLoading) {
    return null;
  }

  return (
    <UnifiedCalendarForm
      open={open}
      onOpenChange={onOpenChange}
      initialData={mapToCalendarFormData()}
      onSave={mapToWorkOrderData}
      onCancel={onCancel}
      title={workOrderId ? 'Edit Work Order Schedule' : 'Schedule Work Order'}
      description="Set the schedule and calendar details for this work order."
      entityType="work_order"
      entityId={workOrderId || 'new'}
    />
  );
};

export default WorkOrderCalendarForm;
