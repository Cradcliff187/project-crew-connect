
import React from 'react';
import { Label } from '@/components/ui/label';
import TimePickerMobile from './TimePickerMobile';

export interface TimeRangeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  error?: string;
  startTimeError?: string;
  endTimeError?: string;
  hoursWorked?: number;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error,
  startTimeError,
  endTimeError,
  hoursWorked
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <TimePickerMobile
            value={startTime}
            onChange={onStartTimeChange}
            label="Start Time"
          />
          {startTimeError && <p className="text-sm text-red-500">{startTimeError}</p>}
        </div>
        
        <div className="space-y-2">
          <Label>End Time</Label>
          <TimePickerMobile
            value={endTime}
            onChange={onEndTimeChange}
            label="End Time"
          />
          {endTimeError && <p className="text-sm text-red-500">{endTimeError}</p>}
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {hoursWorked !== undefined && (
        <div className="text-sm text-muted-foreground">
          Total: <span className="font-medium">{hoursWorked.toFixed(1)} hours</span>
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
