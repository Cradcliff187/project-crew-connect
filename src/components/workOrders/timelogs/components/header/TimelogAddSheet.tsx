
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  onSuccess,
}: TimelogAddSheetProps) => {
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(
    employees.length > 0 ? employees[0].employee_id : null
  );
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setHours('');
    setNotes('');
    setSelectedEmployee(employees.length > 0 ? employees[0].employee_id : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hours || parseFloat(hours) <= 0) {
      toast({
        title: 'Invalid Hours',
        description: 'Please enter a valid number of hours.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('work_order_time_logs')
        .insert({
          work_order_id: workOrderId,
          employee_id: selectedEmployee,
          hours_worked: parseFloat(hours),
          notes,
          work_date: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Time Logged',
        description: 'Time has been logged successfully.',
      });
      
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error logging time:', error);
      toast({
        title: 'Error',
        description: 'Failed to log time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full md:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log Time for Work Order</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Worked *</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0.25"
                placeholder="0.00"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select 
                value={selectedEmployee || undefined} 
                onValueChange={(value) => setSelectedEmployee(value)}
              >
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_id} value={employee.employee_id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter notes about the work performed"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Log Time
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default TimelogAddSheet;
