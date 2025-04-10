
import React, { useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateTimeOptions } from '../utils/timeUtils';

export interface TimeRangeSelectorProps {
  control: Control<any>;
  startFieldName?: string;
  endFieldName?: string;
  hoursFieldName?: string;
  startTime?: string;
  endTime?: string;
  onStartTimeChange?: (value: string) => void;
  onEndTimeChange?: (value: string) => void;
  error?: string;
  hoursWorked?: number;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  control,
  startFieldName = 'startTime',
  endFieldName = 'endTime',
  hoursFieldName = 'hoursWorked',
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error,
  hoursWorked
}) => {
  const timeOptions = generateTimeOptions();
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name={startFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (onStartTimeChange) onStartTimeChange(value);
                }}
                value={field.value || startTime || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={endFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (onEndTimeChange) onEndTimeChange(value);
                }}
                value={field.value || endTime || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={control}
        name={hoursFieldName}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <div className="flex items-center justify-between">
              <FormLabel>Hours Worked</FormLabel>
              <span className="text-sm font-medium">
                {field.value?.toFixed(2) || (hoursWorked?.toFixed(2) || '0.00')}
              </span>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </FormItem>
        )}
      />
    </div>
  );
};

export default TimeRangeSelector;
