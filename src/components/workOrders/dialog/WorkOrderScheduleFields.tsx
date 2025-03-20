
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { UseFormReturn } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { WorkOrderFormValues } from './WorkOrderFormSchema';

interface WorkOrderScheduleFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderScheduleFields = ({ form }: WorkOrderScheduleFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="time_estimate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Hours</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                min="0" 
                step="0.5" 
                {...field}
                value={field.value === undefined ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="scheduled_date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Scheduled Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
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
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={field.value || undefined}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default WorkOrderScheduleFields;
