
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TimeEntryFormValues } from '../types/timeEntryTypes';

interface UseTimeEntrySubmitProps {
  onSuccess?: () => void;
}

export const useTimeEntrySubmit = ({ onSuccess }: UseTimeEntrySubmitProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Submits a time entry to the database
   */
  const submitTimeEntry = async (values: TimeEntryFormValues): Promise<boolean> => {
    if (!values.entityId || !values.employeeId) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a project/work order and an employee.',
        variant: 'destructive',
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting time entry with values:', values);
      
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          entity_type: values.entityType,
          entity_id: values.entityId,
          employee_id: values.employeeId,
          hours_worked: values.hoursWorked,
          notes: values.notes,
          date_worked: values.workDate.toISOString().split('T')[0],
          start_time: values.startTime,
          end_time: values.endTime,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Time entry created successfully:', data);
      
      // Show success message
      toast({
        title: 'Time Logged',
        description: 'Your time entry has been saved successfully.',
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error: any) {
      console.error('Error submitting time entry:', error);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to log time. Please try again.',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitTimeEntry,
    isSubmitting
  };
};

export default useTimeEntrySubmit;
