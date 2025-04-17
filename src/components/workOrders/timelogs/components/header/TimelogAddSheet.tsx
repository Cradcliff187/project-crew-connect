
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { adaptEmployeesFromDatabase, getEmployeeFullName } from '@/utils/employeeAdapter';
import { Employee } from '@/types/common';

const formSchema = z.object({
  date: z.date({
    required_error: 'A date is required',
  }),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  end_time: z.string().min(1, { message: 'End time is required' }),
  hours: z.number().min(0.1, { message: 'Hours must be greater than 0' }),
  notes: z.string().optional(),
  employee_id: z.string().optional(),
});

interface TimelogAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  onSuccess?: () => void;
  employees: { employee_id: string; name: string; }[];
}

export function TimelogAddSheet({
  open,
  onOpenChange,
  workOrderId,
  onSuccess,
  employees,
}: TimelogAddSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      start_time: '09:00',
      end_time: '17:00',
      hours: 8,
      notes: '',
      employee_id: '',
    },
  });

  // Watch for changes to start time and end time to calculate hours
  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');

  // Calculate hours worked when start or end time changes
  const calculateHours = (start: string, end: string) => {
    try {
      const [startHour, startMin] = start.split(':').map(Number);
      const [endHour, endMin] = end.split(':').map(Number);

      let hours = endHour - startHour;
      let minutes = endMin - startMin;

      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }

      return Number((hours + minutes / 60).toFixed(2));
    } catch (error) {
      console.error('Error calculating hours:', error);
      return 0;
    }
  };

  // Update hours when times change
  React.useEffect(() => {
    const hours = calculateHours(startTime, endTime);
    if (hours >= 0) {
      form.setValue('hours', hours);
    } else {
      form.setValue('hours', 0);
    }
  }, [startTime, endTime, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('time_entries').insert({
        entity_type: 'work_order',
        entity_id: workOrderId,
        date_worked: format(values.date, 'yyyy-MM-dd'),
        start_time: values.start_time,
        end_time: values.end_time,
        hours_worked: values.hours,
        notes: values.notes,
        employee_id: values.employee_id,
      }).select();

      if (error) throw error;

      toast({
        title: 'Time entry added',
        description: 'The time entry has been successfully added.',
      });

      form.reset({
        date: new Date(),
        start_time: '09:00',
        end_time: '17:00',
        hours: 8,
        notes: '',
        employee_id: '',
      });

      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adding time entry:', error);

      toast({
        title: 'Error',
        description: error.message || 'Failed to add time entry',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Convert basic employee data to Employee type for the adapter
  const adaptedEmployees: Employee[] = employees.map(emp => ({
    id: emp.employee_id,
    employee_id: emp.employee_id,
    firstName: emp.name.split(' ')[0] || '',
    lastName: emp.name.split(' ').slice(1).join(' ') || '',
    name: emp.name
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Time Entry</SheetTitle>
          <SheetDescription>
            Record the time spent on this work order.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
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
                          variant={'outline'}
                          className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
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
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Total hours worked (automatically calculated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adaptedEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {getEmployeeFullName(employee)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>The employee who performed the work</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional details about this time entry"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default TimelogAddSheet;
