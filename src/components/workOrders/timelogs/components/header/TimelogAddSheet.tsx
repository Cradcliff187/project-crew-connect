
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  employees: { employee_id: string; name: string }[];
  onSuccess: () => void;
}

const formSchema = z.object({
  hours: z.coerce.number().min(0.1, { message: 'Hours must be greater than 0' }),
  date: z.date(),
  description: z.string().optional(),
  employee_id: z.string().optional(),
});

const TimelogAddSheet = ({
  open,
  onOpenChange,
  workOrderId,
  employees,
  onSuccess
}: TimelogAddSheetProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hours: 1,
      date: new Date(),
      description: '',
      employee_id: '',
    },
  });

  const resetForm = () => {
    form.reset({
      hours: 1,
      date: new Date(),
      description: '',
      employee_id: '',
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const timeEntryData = {
        entity_type: 'work_order',
        entity_id: workOrderId,
        date_worked: format(values.date, 'yyyy-MM-dd'),
        hours_worked: values.hours,
        notes: values.description || null,
        employee_id: values.employee_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error, data } = await supabase
        .from('time_entries')
        .insert(timeEntryData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Create expense entry for the labor time
      if (values.hours > 0) {
        // Get employee rate if available
        let hourlyRate = 75; // Default rate
        
        if (values.employee_id) {
          const { data: empData } = await supabase
            .from('employees')
            .select('hourly_rate')
            .eq('employee_id', values.employee_id)
            .maybeSingle();
            
          if (empData?.hourly_rate) {
            hourlyRate = empData.hourly_rate;
          }
        }
        
        const totalAmount = values.hours * hourlyRate;
        
        const { error: expenseError } = await supabase
          .from('expenses')
          .insert({
            entity_type: 'WORK_ORDER',
            entity_id: workOrderId,
            description: `Labor: ${values.hours} hours${values.description ? ' - ' + values.description : ''}`,
            expense_type: 'LABOR',
            amount: totalAmount,
            time_entry_id: data.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            quantity: values.hours,
            unit_price: hourlyRate,
            vendor_id: null
          });
          
        if (expenseError) {
          console.error('Error creating labor expense:', expenseError);
        }
      }
      
      toast({
        title: 'Time log added',
        description: 'Time has been successfully logged.',
      });
      
      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error logging time:', error);
      toast({
        title: 'Error adding time log',
        description: error.message || 'An unexpected error occurred',
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
        
        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Worked</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" min="0.25" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {employees.length > 0 && (
                <FormField
                  control={form.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {employees.map((employee) => (
                            <SelectItem key={employee.employee_id} value={employee.employee_id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the work done" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#0485ea] hover:bg-[#0373ce]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Log Time'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimelogAddSheet;
