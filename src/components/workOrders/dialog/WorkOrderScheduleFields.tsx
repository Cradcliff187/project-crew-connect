import { useState } from 'react';
import { Calendar, CalendarCheck } from 'lucide-react';
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

interface WorkOrderScheduleFieldsProps {
  form: UseFormReturn<WorkOrderFormValues>;
}

const WorkOrderScheduleFields = ({ form }: WorkOrderScheduleFieldsProps) => {
  const [scheduledDateOpen, setScheduledDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const scheduledDate = form.watch('scheduled_date');

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

      {/* Automatic Calendar Sync Notification */}
      {scheduledDate && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start space-x-3">
            <CalendarCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Automatic Calendar Integration</p>
              <p className="text-sm text-blue-700 mt-1">
                This work order will be automatically added to your{' '}
                <strong>Work Orders Calendar</strong> when created.
                {form.watch('assigned_to') &&
                  ' The assignee will receive a calendar invite automatically.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderScheduleFields;
