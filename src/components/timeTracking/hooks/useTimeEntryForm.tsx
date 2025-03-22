
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { addHours, parse, format } from 'date-fns';

export type TimeEntryFormValues = {
  entityType: 'work_order' | 'project';
  entityId: string;
  employeeId: string;
  workDate: Date;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes: string;
};

const calculateHoursWorked = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let hours = endHour - startHour;
  const minutes = endMinute - startMinute;
  
  if (hours < 0) hours += 24;
  
  return Math.round((hours + minutes / 60) * 100) / 100;
};

const timeEntrySchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  employeeId: z.string().min(1, "Please select an employee"),
  workDate: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in 24-hour format (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Please enter a valid time in 24-hour format (HH:MM)"),
  hoursWorked: z.number().min(0.01, "Hours worked must be greater than 0"),
  notes: z.string().optional(),
}).refine((data) => {
  const hoursWorked = calculateHoursWorked(data.startTime, data.endTime);
  return hoursWorked > 0;
}, {
  message: "End time must be after start time",
  path: ['endTime']
});

export const useTimeEntryForm = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<TimeEntryFormValues | null>(null);
  const [newTimeEntryId, setNewTimeEntryId] = useState<string | null>(null);
  
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      employeeId: '',
      workDate: new Date(),
      startTime: '08:00',
      endTime: '17:00',
      hoursWorked: 9,
      notes: '',
    },
  });
  
  // Watch start and end times to calculate hours worked
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  // Update hours worked whenever start or end time changes
  if (startTime && endTime) {
    const hoursWorked = calculateHoursWorked(startTime, endTime);
    form.setValue('hoursWorked', hoursWorked);
  }
  
  const handleSubmit = (values: TimeEntryFormValues) => {
    setConfirmationData(values);
    setShowConfirmDialog(true);
  };
  
  const confirmSubmit = async (): Promise<string | null> => {
    if (!confirmationData) return null;
    
    setIsLoading(true);
    
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
      } = confirmationData;
      
      // Format date for the database
      const formattedDate = format(workDate, 'yyyy-MM-dd');
      
      console.log('Submitting time entry:', {
        entity_type: entityType,
        entity_id: entityId,
        date_worked: formattedDate,
        start_time: startTime,
        end_time: endTime,
        hours_worked: hoursWorked,
        employee_id: employeeId,
        notes
      });
      
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
      
      console.log('Time entry created:', timeEntry);
      
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
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    form,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
    confirmationData,
    handleSubmit,
    confirmSubmit,
    newTimeEntryId,
    setNewTimeEntryId
  };
};
