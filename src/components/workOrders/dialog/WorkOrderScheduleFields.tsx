import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import {
  FormField,
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { WorkOrderFormValues } from './WorkOrderFormSchema';
import { UseFormReturn } from 'react-hook-form';
import { CalendarIntegrationToggle } from '@/components/common/CalendarIntegrationToggle';

interface WorkOrderScheduleFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderScheduleFields = ({ form }: WorkOrderScheduleFieldsProps) => {
  const [scheduledDateOpen, setScheduledDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="scheduled_date"
          render={({ field }) => (
            <div className="relative">
              <FormLabel>Scheduled Date</FormLabel>
              <Popover open={scheduledDateOpen} onOpenChange={setScheduledDateOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => {
                      field.onChange(date);
                      setScheduledDateOpen(false);
                    }}
                    disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
              <FormDescription>When the work is scheduled to start</FormDescription>
            </div>
          )}
        />

        <FormField
          control={form.control}
          name="due_by_date"
          render={({ field }) => (
            <div className="relative">
              <FormLabel>Due By Date</FormLabel>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => {
                      field.onChange(date);
                      setDueDateOpen(false);
                    }}
                    disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
              <FormDescription>When the work must be completed by</FormDescription>
            </div>
          )}
        />
      </div>

      {/* Google Calendar Integration */}
      <FormField
        control={form.control}
        name="calendar_sync_enabled"
        render={({ field }) => (
          <FormControl>
            <CalendarIntegrationToggle
              value={field.value}
              onChange={field.onChange}
              disabled={!form.watch('scheduled_date')}
              disabledReason="A scheduled date is required for calendar integration"
              description="When enabled, this work order will be synced with your Google Calendar"
              entityType="work_order"
            />
          </FormControl>
        )}
      />
    </div>
  );
};

export default WorkOrderScheduleFields;
