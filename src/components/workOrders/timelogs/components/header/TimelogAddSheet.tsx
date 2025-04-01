
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  employees: { employee_id: string; name: string }[];
  onSuccess: () => void;
}

const TimelogAddSheet = ({
  open,
  onOpenChange,
  workOrderId,
  employees,
  onSuccess
}: TimelogAddSheetProps) => {
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
      const timelogEntry = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        employee_id: employeeId || null,
        hours_worked: parseFloat(hours),
        date_worked: new Date().toISOString().split('T')[0],
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('time_entries')
        .insert(timelogEntry);
        
      if (error) throw error;
      
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
          <SheetTitle>Log Time</SheetTitle>
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

export default TimelogAddSheet;
