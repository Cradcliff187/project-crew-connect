import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/types/common';
import { adaptEmployeesFromDatabase } from '@/utils/employeeAdapter';

const formSchema = z.object({
  employeeId: z.string().min(1, { message: 'Please select an employee' }),
  dateWorked: z.date({
    required_error: 'A date is required.',
  }),
  hoursWorked: z.number().min(0.1, { message: 'Hours must be greater than 0' }),
  notes: z.string().optional(),
});

interface ProjectTimelogAddSheetProps {
  projectId: string;
  open: boolean;
  setOpen?: (open: boolean) => void;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  employees?: { employee_id: string; name: string }[];
}

const ProjectTimelogAddSheet: React.FC<ProjectTimelogAddSheetProps> = ({
  projectId,
  open,
  setOpen,
  onOpenChange,
  onSuccess,
  employees: providedEmployees,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (setOpen) setOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: '',
      dateWorked: new Date(),
      hoursWorked: 1,
      notes: '',
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = form;

  useEffect(() => {
    if (providedEmployees && providedEmployees.length > 0) {
      const formattedEmployees = providedEmployees.map(e => ({
        id: e.employee_id,
        employee_id: e.employee_id,
        name: e.name,
        firstName: '',
        lastName: '',
      }));
      setEmployees(formattedEmployees);
    } else {
      const fetchEmployees = async () => {
        const { data, error } = await supabase.from('employees').select('employee_id, first_name, last_name, email, phone, role, hourly_rate, status');

        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to load employees',
            variant: 'destructive',
          });
        } else {
          setEmployees(adaptEmployeesFromDatabase(data || []));
        }
      };
      
      fetchEmployees();
    }
  }, [providedEmployees, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from('time_entries').insert([
        {
          entity_type: 'project',
          entity_id: projectId,
          employee_id: values.employeeId,
          date_worked: format(values.dateWorked, 'yyyy-MM-dd'),
          hours_worked: values.hoursWorked,
          notes: values.notes,
          start_time: '09:00:00',
          end_time: '17:00:00'
        },
      ]);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add timelog: ' + error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Timelog added successfully',
        });
        handleOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add timelog: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Timelog</DialogTitle>
          <DialogDescription>Add a timelog to this project</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="employeeId">Employee</Label>
            <Select onValueChange={value => setValue('employeeId', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(employee => (
                  <SelectItem key={employee.id || employee.employee_id} value={employee.id || employee.employee_id || ''}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId.message}</p>
            )}
          </div>
          <div>
            <Label>Date Worked</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !form.getValues('dateWorked') && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.getValues('dateWorked') ? (
                    format(form.getValues('dateWorked'), 'PPP')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.getValues('dateWorked')}
                  onSelect={date => setValue('dateWorked', date)}
                  disabled={date => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dateWorked && (
              <p className="text-sm text-red-500">{errors.dateWorked.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="hoursWorked">Hours Worked</Label>
            <Input
              id="hoursWorked"
              type="number"
              step="0.5"
              placeholder="Enter hours worked"
              {...register('hoursWorked', { valueAsNumber: true })}
            />
            {errors.hoursWorked && (
              <p className="text-sm text-red-500">{errors.hoursWorked.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" type="text" placeholder="Enter notes" {...register('notes')} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Add Timelog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTimelogAddSheet;
