
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/types/timeTracking';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import TimeRangeSelector from './form/TimeRangeSelector';
import EmployeeSelect from './form/EmployeeSelect';
import { useEntityData } from './hooks/useEntityData';
import { calculateHours } from './utils/timeUtils';

export interface TimeEntryEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntryId: string;
  onSuccess: () => void;
  entry?: TimeEntry;
}

interface EditFormValues {
  workDate: Date;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  notes: string;
  employeeId: string;
}

const TimeEntryEditDialog: React.FC<TimeEntryEditDialogProps> = ({
  open,
  onOpenChange,
  timeEntryId,
  onSuccess,
  entry
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { employees } = useEntityData();
  
  const form = useForm<EditFormValues>({
    defaultValues: {
      workDate: new Date(),
      startTime: '',
      endTime: '',
      hoursWorked: 0,
      notes: '',
      employeeId: 'none'
    }
  });
  
  // Load entry data when the dialog opens or entry changes
  useEffect(() => {
    if (open && timeEntryId) {
      setIsLoading(true);
      
      const fetchTimeEntry = async () => {
        try {
          const { data, error } = await supabase
            .from('time_entries')
            .select('*')
            .eq('id', timeEntryId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            form.setValue('workDate', new Date(data.date_worked));
            form.setValue('startTime', data.start_time);
            form.setValue('endTime', data.end_time);
            form.setValue('hoursWorked', data.hours_worked);
            form.setValue('notes', data.notes || '');
            form.setValue('employeeId', data.employee_id || 'none');
          }
        } catch (error) {
          console.error('Error fetching time entry:', error);
          toast({
            title: "Error",
            description: "Failed to fetch time entry details",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchTimeEntry();
    }
  }, [open, timeEntryId, form, toast]);
  
  const handleSave = async (values: EditFormValues) => {
    if (!timeEntryId) return;
    
    setIsSubmitting(true);
    
    try {
      // Format date for database
      const formattedDate = values.workDate.toISOString().split('T')[0];
      
      // Get employee rate if available
      let hourlyRate = 75; // Default rate
      if (values.employeeId && values.employeeId !== 'none') {
        const { data } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', values.employeeId)
          .maybeSingle();
          
        if (data?.hourly_rate) {
          hourlyRate = data.hourly_rate;
        }
      }
      
      // Calculate total cost
      const totalCost = values.hoursWorked * hourlyRate;
      
      // Update the time entry
      const { error } = await supabase
        .from('time_entries')
        .update({
          date_worked: formattedDate,
          start_time: values.startTime,
          end_time: values.endTime,
          hours_worked: values.hoursWorked,
          notes: values.notes || null,
          employee_id: values.employeeId === 'none' ? null : values.employeeId,
          employee_rate: hourlyRate,
          total_cost: totalCost,
          updated_at: new Date().toISOString()
        })
        .eq('id', timeEntryId);
        
      if (error) throw error;
      
      // Update related expense if it exists
      try {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('id')
          .eq('time_entry_id', timeEntryId)
          .eq('expense_type', 'LABOR');
          
        if (expenses && expenses.length > 0) {
          await supabase
            .from('expenses')
            .update({
              amount: totalCost,
              quantity: values.hoursWorked,
              unit_price: hourlyRate,
              description: `Labor: ${values.hoursWorked} hours`,
              updated_at: new Date().toISOString()
            })
            .eq('id', expenses[0].id);
        }
      } catch (expenseError) {
        console.error('Error updating related expense:', expenseError);
        // Continue execution despite this error
      }
      
      toast({
        title: "Time entry updated",
        description: "Time entry has been successfully updated."
      });
      
      onSuccess();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-4 text-center">Loading time entry data...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={form.control}
                name="workDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                    />
                  </FormItem>
                )}
              />
              
              <TimeRangeSelector
                control={form.control}
                startFieldName="startTime"
                endFieldName="endTime"
                hoursFieldName="hoursWorked"
              />
              
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <EmployeeSelect
                    control={form.control}
                    employees={employees}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Add notes about work performed..."
                      rows={3}
                    />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryEditDialog;
