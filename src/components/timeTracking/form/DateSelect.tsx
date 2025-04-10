
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { DatePicker } from "@/components/ui/date-picker";
import { TimeEntryFormValues } from '@/types/timeTracking';

interface DateSelectProps {
  control: Control<TimeEntryFormValues>;
}

const DateSelect: React.FC<DateSelectProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="workDate"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Work Date</FormLabel>
          <FormControl>
            <DatePicker 
              date={field.value} 
              setDate={(date) => date && field.onChange(date)}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default DateSelect;
