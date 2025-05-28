import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateHours } from '@/utils/time/timeUtils';
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
  const [formData, setFormData] = useState({
    employee_id: '',
    date_worked: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    notes: '',
  });

  const getCalculatedHours = () => {
    return calculateHours(formData.start_time, formData.end_time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const hoursWorked = getCalculatedHours();

      if (hoursWorked <= 0) {
        toast({
          title: 'Invalid time',
          description: 'End time must be after start time',
          variant: 'destructive',
        });
        return;
      }

      let employeeRate = null;
      // Check for "none" special value that means no employee is selected
      const actualEmployeeId = formData.employee_id === 'none' ? null : formData.employee_id;

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
      const totalCost = hoursWorked * hourlyRate;

      // Create time entry
      const timelogEntry = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        employee_id: actualEmployeeId,
        hours_worked: hoursWorked,
        date_worked: formData.date_worked,
        start_time: formData.start_time,
        end_time: formData.end_time,
        employee_rate: hourlyRate,
        total_cost: totalCost,
        notes: formData.notes || null,
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
          description: `Labor: ${hoursWorked} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: insertedEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: hoursWorked,
          unit_price: hourlyRate,
          vendor_id: null,
        };

        await supabase.from('expenses').insert(laborExpenseData);
      }

      toast({
        title: 'Time entry added',
        description: `${hoursWorked.toFixed(1)} hours have been logged successfully.`,
      });

      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        employee_id: '',
        date_worked: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        notes: '',
      });
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <Select
              value={formData.employee_id}
              onValueChange={value => setFormData(prev => ({ ...prev, employee_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No employee assigned</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.employee_id} value={employee.employee_id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={formData.date_worked}
              onChange={e => setFormData(prev => ({ ...prev, date_worked: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                value={formData.start_time}
                onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                value={formData.end_time}
                onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hours: {getCalculatedHours().toFixed(1)}</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Details about the work performed"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <SheetFooter className="pt-4">
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
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Time Entry'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
