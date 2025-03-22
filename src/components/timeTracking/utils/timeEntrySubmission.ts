
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeEntryFormValues } from '../schemas/timeEntrySchema';

/**
 * Submit a time entry to the database
 * @param data Time entry form data
 * @returns The ID of the created time entry, or null if an error occurred
 */
export const submitTimeEntry = async (data: TimeEntryFormValues): Promise<string | null> => {
  try {
    const {
      entityType,
      entityId,
      employeeId,
      workDate,
      startTime,
      endTime,
      hoursWorked,
      notes
    } = data;
    
    // Format date for the database
    const formattedDate = format(workDate, 'yyyy-MM-dd');
    
    // Insert time entry
    const { data: timeEntry, error } = await supabase
      .from('time_entries')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        date_worked: formattedDate,
        start_time: startTime,
        end_time: endTime,
        hours_worked: hoursWorked,
        employee_id: employeeId,
        notes,
        has_receipts: false,
      })
      .select('id, entity_id, entity_type')
      .single();
    
    if (error) throw error;
    
    // If it's a work order, also create a work order time log
    if (entityType === 'work_order') {
      const { error: workOrderLogError } = await supabase
        .from('work_order_time_logs')
        .insert({
          work_order_id: entityId,
          employee_id: employeeId,
          hours_worked: hoursWorked,
          notes,
          work_date: formattedDate,
        });
      
      if (workOrderLogError) {
        console.warn('Warning: Could not create work order time log:', workOrderLogError);
      }
    }
    
    return timeEntry.id;
  } catch (error: any) {
    console.error('Error submitting time entry:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to submit time entry',
      variant: 'destructive',
    });
    return null;
  }
};
