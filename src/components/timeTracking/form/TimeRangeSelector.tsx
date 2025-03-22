
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimeRangeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  startTimeError?: string;
  endTimeError?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  startTimeError,
  endTimeError
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          className={startTimeError ? "border-red-500" : ""}
        />
        {startTimeError && (
          <div className="text-xs text-red-500">{startTimeError}</div>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="endTime">End Time</Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          className={endTimeError ? "border-red-500" : ""}
        />
        {endTimeError && (
          <div className="text-xs text-red-500">{endTimeError}</div>
        )}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
