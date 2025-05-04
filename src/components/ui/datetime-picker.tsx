import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from './time-picker'; // Corrected import path

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  className?: string;
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  // Use value directly if provided, otherwise undefined.
  // The internal state selectedDateTime was causing issues with updates.
  const selectedDateTime = value;

  const handleSelect = (day: Date | undefined, hour: number, minute: number) => {
    if (!day) {
      if (onChange) {
        onChange(undefined);
      }
      return;
    }
    // Construct new date ensuring we use the selected day's date parts
    const newDateTime = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      hour, // Use the hour passed from TimePicker or current/default
      minute, // Use the minute passed from TimePicker or current/default
      0 // seconds
    );
    if (onChange) {
      onChange(newDateTime);
    }
  };

  // When the date part changes via Calendar
  const handleDateSelect = (day: Date | undefined) => {
    // Keep the existing time part if a date is already selected, otherwise default to midnight
    const hour = selectedDateTime?.getHours() ?? 0;
    const minute = selectedDateTime?.getMinutes() ?? 0;
    handleSelect(day, hour, minute);
  };

  // When the time part changes via TimePicker
  const handleTimeChange = (time: { hour: number; minute: number }) => {
    // Keep the existing date part if available, otherwise default to today
    const day = selectedDateTime ?? new Date();
    handleSelect(day, time.hour, time.minute);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal h-9', // Adjusted height
            !selectedDateTime && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDateTime ? (
            format(selectedDateTime, "PPP '@' h:mm a") // Standard format
          ) : (
            <span>Pick date & time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDateTime}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <TimePicker
            value={{
              hour: selectedDateTime?.getHours() ?? 0,
              minute: selectedDateTime?.getMinutes() ?? 0,
            }}
            onChange={handleTimeChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
