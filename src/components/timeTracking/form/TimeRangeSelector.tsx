import React, { useEffect } from 'react';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { calculateHours } from '../utils/timeUtils';
import TimePickerSelect from './TimePickerSelect';
import TimePickerMobile from './TimePickerMobile';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Control, Controller } from 'react-hook-form';

export interface TimeRangeSelectorProps {
  control?: Control<any>;
  startFieldName?: string;
  endFieldName?: string;
  hoursFieldName?: string;
  startTime?: string;
  endTime?: string;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
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
  hoursWorked,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const TimePicker = isMobile ? TimePickerMobile : TimePickerSelect;
  
  // If using form control, render form fields
  if (control) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name={startFieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <TimePicker
                  label=""
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name={endFieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <TimePicker
                  label=""
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </div>
        
        {hoursFieldName && (
          <FormField
            control={control}
            name={hoursFieldName}
            render={({ field }) => (
              <FormItem>
                <div className="text-sm">
                  Hours: <span className="font-medium">{Number(field.value).toFixed(1)}</span>
                </div>
              </FormItem>
            )}
          />
        )}
        
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </div>
    );
  }
  
  // Otherwise, use the controlled component approach
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel>Start Time</FormLabel>
          <TimePicker
            value={startTime || ''}
            onChange={(value) => {
              if (onStartTimeChange) onStartTimeChange(value);
            }}
          />
        </div>
        
        <div>
          <FormLabel>End Time</FormLabel>
          <TimePicker
            value={endTime || ''}
            onChange={(value) => {
              if (onEndTimeChange) onEndTimeChange(value);
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm">
          Hours: <span className="font-medium">{hoursWorked !== undefined ? Number(hoursWorked).toFixed(1) : '0.0'}</span>
        </div>
        
        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
