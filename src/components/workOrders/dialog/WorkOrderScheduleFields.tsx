import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { CalendarClock, CaretSortIcon } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '../WorkOrderFormSchema';

interface WorkOrderScheduleFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderScheduleFields = ({ form }: WorkOrderScheduleFieldsProps) => {
  const [date, setDate] = useState<Date>();
  
  // Replace string with array of dates for matcher
  const disablePastDates = {
    before: new Date()
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Scheduled Date */}
      <FormField
        control={form.control}
        name="scheduled_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Scheduled Date</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[200px] pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), 'MM/dd/yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={disablePastDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
          </FormItem>
        )}
      />
      
      {/* Due By Date */}
      <FormField
        control={form.control}
        name="due_by_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Due By Date</FormLabel>
            <FormControl>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-[200px] pl-3 text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    {field.value ? (
                      format(new Date(field.value), 'MM/dd/yyyy')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={disablePastDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default WorkOrderScheduleFields;
