import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import TimeEntryForm from '@/components/timeTracking/TimeEntryForm';
import { TimeEntry } from '@/types/timeTracking';
import { Employee } from '@/types/common';

interface TimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  employees: Employee[];
  onSuccess: () => void;
}

export const TimelogAddSheet = ({
  open,
  onOpenChange,
  workOrderId,
  employees,
  onSuccess,
}: TimelogAddSheetProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: Partial<TimeEntry>) => {
    setIsSubmitting(true);

    try {
      let employeeRate = null;
      // Check for "none" special value that means no employee is selected
      const actualEmployeeId = values.employee_id === 'none' ? null : values.employee_id;

      if (actualEmployeeId) {
        // Get employee rate if available
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', actualEmployeeId)
          .maybeSingle();

        employeeRate = empData?.hourly_rate;
      }

      // Calculate total cost
      const hourlyRate = employeeRate || 75; // Default rate
      const totalCost = values.hours_worked! * hourlyRate;

      // Create time entry
      const timelogEntry = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        employee_id: actualEmployeeId,
        hours_worked: values.hours_worked,
        date_worked: values.date_worked,
        start_time: values.start_time,
        end_time: values.end_time,
        employee_rate: hourlyRate,
        total_cost: totalCost,
        notes: values.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedEntry, error } = await supabase
        .from('time_entries')
        .insert(timelogEntry)
        .select('id')
        .single();

      if (error) throw error;

      // Create expense entry for labor time
      if (insertedEntry?.id) {
        const laborExpenseData = {
          entity_type: 'WORK_ORDER',
          entity_id: workOrderId,
          description: `Labor: ${values.hours_worked} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: insertedEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: values.hours_worked,
          unit_price: hourlyRate,
          vendor_id: null,
        };

        await supabase.from('expenses').insert(laborExpenseData);
      }

      toast({
        title: 'Time entry added',
        description: `${values.hours_worked} hours have been logged successfully.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add time entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log Time</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <TimeEntryForm
            initialValues={{
              employee_id: 'none',
            }}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            title="Log Work Order Time"
            employees={employees}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
