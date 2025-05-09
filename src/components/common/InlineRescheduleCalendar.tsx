import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Save, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addHours, isSameDay } from 'date-fns';
import { TimePickerDemo } from '@/components/ui/time-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface InlineRescheduleCalendarProps {
  eventId: string;
  entityType: 'work_order' | 'project' | 'ad_hoc';
  entityId: string;
  currentStartDate: Date;
  currentEndDate?: Date | null;
  isAllDay?: boolean;
  onReschedule: (startDate: Date, endDate: Date | null, isAllDay: boolean) => Promise<boolean>;
  onCancel?: () => void;
  disabled?: boolean;
}

const InlineRescheduleCalendar: React.FC<InlineRescheduleCalendarProps> = ({
  eventId,
  entityType,
  entityId,
  currentStartDate,
  currentEndDate = null,
  isAllDay = false,
  onReschedule,
  onCancel,
  disabled = false,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(currentStartDate);
  const [startTime, setStartTime] = useState<Date>(currentStartDate);
  const [endTime, setEndTime] = useState<Date>(currentEndDate || addHours(currentStartDate, 1));
  const [allDay, setAllDay] = useState<boolean>(isAllDay);

  const handleReschedule = async () => {
    if (!selectedDate) {
      toast({
        title: 'Invalid date',
        description: 'Please select a valid date.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new date objects combining selected date with times
      const newStartDate = new Date(selectedDate);
      if (!allDay) {
        newStartDate.setHours(startTime.getHours(), startTime.getMinutes());
      } else {
        newStartDate.setHours(0, 0, 0, 0);
      }

      let newEndDate: Date | null = null;
      if (!allDay && endTime) {
        newEndDate = new Date(selectedDate);
        newEndDate.setHours(endTime.getHours(), endTime.getMinutes());

        // If end time is earlier than start time, assume it's for the next day
        if (newEndDate.getTime() <= newStartDate.getTime()) {
          newEndDate.setDate(newEndDate.getDate() + 1);
        }
      } else if (allDay) {
        // For all-day events, end date is the same day at 23:59:59
        newEndDate = new Date(selectedDate);
        newEndDate.setHours(23, 59, 59, 999);
      }

      const success = await onReschedule(newStartDate, newEndDate, allDay);

      if (success) {
        toast({
          title: 'Event rescheduled',
          description: `Successfully rescheduled to ${format(newStartDate, allDay ? 'PPP' : 'PPp')}`,
        });
        setIsOpen(false);
      } else {
        toast({
          title: 'Reschedule failed',
          description: 'Failed to reschedule the event. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rescheduling event:', error);
      toast({
        title: 'Reschedule failed',
        description: 'An error occurred while rescheduling the event.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDisplayDate = () => {
    if (!currentStartDate) return 'Not scheduled';

    if (isAllDay) {
      return format(currentStartDate, 'PPP');
    }

    if (currentEndDate && !isSameDay(currentStartDate, currentEndDate)) {
      return `${format(currentStartDate, 'PPp')} - ${format(currentEndDate, 'PPp')}`;
    }

    return currentEndDate
      ? `${format(currentStartDate, 'PPp')} - ${format(currentEndDate, 'p')}`
      : format(currentStartDate, 'PPp');
  };

  return (
    <div className="inline-flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !currentStartDate && 'text-muted-foreground'
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDisplayDate()}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to reschedule</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 pb-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Reschedule</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={e => setAllDay(e.target.checked)}
                  className="rounded"
                />
                All Day
              </label>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            className="rounded-t-none"
          />

          {!allDay && (
            <div className="p-4 border-t flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Clock className="mr-2 h-3 w-3" /> Start Time
                </label>
                <TimePickerDemo setDate={setStartTime} date={startTime} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Clock className="mr-2 h-3 w-3" /> End Time
                </label>
                <TimePickerDemo setDate={setEndTime} date={endTime} />
              </div>
            </div>
          )}

          <div className="p-4 pt-0 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onCancel?.();
                setIsOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReschedule}
              disabled={!selectedDate || isSubmitting}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default InlineRescheduleCalendar;
