
import React from 'react';
import { Timer } from 'lucide-react';
import { Label } from '@/components/ui/label';
import TimeRangeSelector from '../TimeRangeSelector';

interface TimeDisplayProps {
  startTime: string;
  endTime: string;
  hoursWorked: number;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  startTimeError?: string;
  endTimeError?: string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  startTime,
  endTime,
  hoursWorked,
  onStartTimeChange,
  onEndTimeChange,
  startTimeError,
  endTimeError
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Time Range</Label>
        {startTime && endTime && (
          <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            <Timer className="h-3.5 w-3.5 mr-1" />
            <span>Duration: {hoursWorked.toFixed(2)} hours</span>
          </div>
        )}
      </div>
      
      <TimeRangeSelector
        startTime={startTime}
        endTime={endTime}
        onStartTimeChange={onStartTimeChange}
        onEndTimeChange={onEndTimeChange}
        startTimeError={startTimeError}
        endTimeError={endTimeError}
      />
    </div>
  );
};

export default TimeDisplay;
