
import React, { useEffect } from 'react';
import { Control, Controller, useForm } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateTimeOptions } from '../utils/timeUtils';

export interface TimeRangeSelectorProps {
  control?: Control<any>;
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
  
  // If we don't have control, create a local form instance for standalone usage
  const localForm = useForm();
  const formControl = control || localForm.control;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {control ? (
          <FormField
            control={formControl}
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
        ) : (
          <div className="space-y-2">
            <FormLabel>Start Time</FormLabel>
            <Select
              onValueChange={(value) => {
                if (onStartTimeChange) onStartTimeChange(value);
              }}
              value={startTime || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {control ? (
          <FormField
            control={formControl}
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
        ) : (
          <div className="space-y-2">
            <FormLabel>End Time</FormLabel>
            <Select
              onValueChange={(value) => {
                if (onEndTimeChange) onEndTimeChange(value);
              }}
              value={endTime || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {control ? (
        <FormField
          control={formControl}
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
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <FormLabel>Hours Worked</FormLabel>
            <span className="text-sm font-medium">
              {hoursWorked?.toFixed(2) || '0.00'}
            </span>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
