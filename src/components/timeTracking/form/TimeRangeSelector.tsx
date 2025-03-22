
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  // Generate time options in 15-minute intervals (96 options for 24 hours)
  // but display them in 12-hour format with AM/PM
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const value = `${formattedHour}:${formattedMinute}`; // 24-hour format as value
        
        // Convert to 12-hour format for display
        const displayHour = hour % 12 || 12;
        const period = hour >= 12 ? 'PM' : 'AM';
        const display = `${displayHour}:${formattedMinute.padStart(2, '0')} ${period}`;
        
        options.push({ value, display });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label htmlFor="startTime">Start Time</Label>
        <Select value={startTime} onValueChange={onStartTimeChange}>
          <SelectTrigger id="startTime" className={startTimeError ? "border-red-500" : ""}>
            <SelectValue placeholder="Select start time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={`start-${time.value}`} value={time.value}>
                {time.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {startTimeError && (
          <div className="text-xs text-red-500">{startTimeError}</div>
        )}
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="endTime">End Time</Label>
        <Select value={endTime} onValueChange={onEndTimeChange}>
          <SelectTrigger id="endTime" className={endTimeError ? "border-red-500" : ""}>
            <SelectValue placeholder="Select end time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={`end-${time.value}`} value={time.value}>
                {time.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {endTimeError && (
          <div className="text-xs text-red-500">{endTimeError}</div>
        )}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
