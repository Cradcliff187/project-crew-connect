
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  employees: { employee_id: string; name: string }[];
  onSuccess: () => void;
}

export const ProjectTimelogAddSheet = ({
  open,
  onOpenChange,
  projectId,
  employees,
  onSuccess
}: ProjectTimelogAddSheetProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hours, setHours] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hours || parseFloat(hours) <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Please enter a valid number of hours worked.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current date and create placeholder time values
      const currentDate = new Date().toISOString().split('T')[0];
      // Set start time at 9 AM
      const startTime = `09:00:00`;
      // Calculate end time based on hours worked
      const hoursNum = parseFloat(hours);
      const endHour = Math.min(9 + hoursNum, 23);
      const endMinutes = (hoursNum % 1) * 60;
      const endTime = `${Math.floor(endHour).toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
      
      let employeeRate = null;
      if (employeeId) {
        // Get employee rate if available
        const { data: empData } = await supabase
          .from('employees')
          .select('hourly_rate')
          .eq('employee_id', employeeId)
          .maybeSingle();
        
        employeeRate = empData?.hourly_rate;
      }
      
      // Calculate total cost
      const hourlyRate = employeeRate || 75; // Default rate
      const totalCost = hoursNum * hourlyRate;
      
      const timelogEntry = {
        entity_type: 'project',
        entity_id: projectId,
        employee_id: employeeId || null,
        hours_worked: hoursNum,
        date_worked: currentDate,
        start_time: startTime,
        end_time: endTime,
        employee_rate: hourlyRate,
        total_cost: totalCost,
        notes: notes || null,
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
          entity_type: 'PROJECT',
          entity_id: projectId,
          description: `Labor: ${hoursNum} hours`,
          expense_type: 'LABOR',
          amount: totalCost,
          time_entry_id: insertedEntry.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          quantity: hoursNum,
          unit_price: hourlyRate,
          vendor_id: null
        };
        
        await supabase
          .from('expenses')
          .insert(laborExpenseData);
      }
      
      toast({
        title: 'Time entry added',
        description: `${hours} hours have been logged successfully.`,
      });
      
      // Reset form and close sheet
      setHours('');
      setEmployeeId('');
      setNotes('');
      onSuccess();
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
          <SheetTitle>Log Project Time</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked</Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0.25"
              placeholder="Enter hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employee">Employee</Label>
            <select
              id="employee"
              className="w-full border border-input bg-background px-3 py-2 rounded-md"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.employee_id} value={employee.employee_id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about work performed..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
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
              {isSubmitting ? 'Saving...' : 'Log Time'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
