
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { timeOptions } from '../utils/timeUtils';

interface TimeRangeSelectorProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  hoursWorked?: number;
  error?: string;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  hoursWorked,
  error
}) => {
  const times = timeOptions();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <Select
            value={startTime}
            onValueChange={onStartTimeChange}
          >
            <SelectTrigger id="startTime">
              <SelectValue placeholder="Start time" />
            </SelectTrigger>
            <SelectContent>
              {times.map((time) => (
                <SelectItem key={`start-${time.value}`} value={time.value}>
                  {time.display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Select
            value={endTime}
            onValueChange={onEndTimeChange}
          >
            <SelectTrigger id="endTime">
              <SelectValue placeholder="End time" />
            </SelectTrigger>
            <SelectContent>
              {times.map((time) => (
                <SelectItem key={`end-${time.value}`} value={time.value}>
                  {time.display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {hoursWorked !== undefined && (
        <div className="rounded-md bg-muted p-3 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
            <span>Total Hours</span>
          </div>
          <div className="font-medium">{hoursWorked}</div>
        </div>
      )}
      
      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default TimeRangeSelector;
