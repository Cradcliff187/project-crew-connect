
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/timeTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useEntityData } from './hooks/useEntityData';
import TimeEntryFormFields from './form/TimeEntryFormFields';

interface TimeEntryEditProps {
  timeEntry: TimeEntry;
  onCancel: () => void;
  onSuccess: () => void;
}

const TimeEntryEdit: React.FC<TimeEntryEditProps> = ({ 
  timeEntry, 
  onCancel, 
  onSuccess 
}) => {
  const [selectedEmployeeRate, setSelectedEmployeeRate] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with existing time entry data
  const { 
    form, 
    handleSubmit 
  } = useTimeEntryForm(onSuccess, true);
  
  const {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);
  
  // Populate form with existing time entry data
  useEffect(() => {
    if (timeEntry) {
      const startDate = new Date(timeEntry.date_worked);
      
      form.reset({
        entityType: timeEntry.entity_type,
        entityId: timeEntry.entity_id,
        employeeId: timeEntry.employee_id || '',
        workDate: startDate,
        startTime: timeEntry.start_time,
        endTime: timeEntry.end_time,
        hoursWorked: timeEntry.hours_worked,
        notes: timeEntry.notes || '',
      });
    }
  }, [timeEntry, form]);
  
  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          entity_type: data.entityType,
          entity_id: data.entityId,
          date_worked: format(data.workDate, 'yyyy-MM-dd'),
          start_time: data.startTime,
          end_time: data.endTime,
          hours_worked: data.hoursWorked,
          employee_id: data.employeeId,
          notes: data.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', timeEntry.id);
      
      if (error) throw error;
      
      toast({
        title: "Time entry updated",
        description: "The time entry has been updated successfully."
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error updating time entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update time entry",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Time Entry</CardTitle>
      </CardHeader>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <TimeEntryFormFields
          form={form}
          workOrders={workOrders}
          projects={projects}
          employees={employees}
          isLoadingEntities={isLoadingEntities}
          getSelectedEntityDetails={getSelectedEntityDetails}
          selectedEmployeeRate={selectedEmployeeRate}
          setSelectedEmployeeRate={setSelectedEmployeeRate}
        />
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TimeEntryEdit;
