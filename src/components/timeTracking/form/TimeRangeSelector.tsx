
import React from 'react';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import TimePickerMobile from './TimePickerMobile';

interface TimeRangeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  error?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  error
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
        </div>
        
        <div className="space-y-2">
          <Label>End Time</Label>
          <TimePickerMobile
            value={endTime}
            onChange={onEndTimeChange}
            label="End Time"
          />
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TimeRangeSelector;
