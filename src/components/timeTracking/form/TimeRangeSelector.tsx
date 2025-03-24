
import React from 'react';
import { Label } from '@/components/ui/label';

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
  // Generate time options in 15-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourString = hour.toString().padStart(2, '0');
        const minuteString = minute.toString().padStart(2, '0');
        const value = `${hourString}:${minuteString}`;
        
        // Format for display (12-hour clock)
        let displayHour = hour % 12;
        if (displayHour === 0) displayHour = 12;
        const period = hour < 12 ? 'AM' : 'PM';
        const display = `${displayHour}:${minuteString} ${period}`;
        
        options.push({ value, display });
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start-time" className={startTimeError ? "text-destructive" : ""}>Start Time</Label>
        <select
          id="start-time"
          className={`w-full border rounded-md px-3 py-2 ${startTimeError ? "border-destructive" : "border-input"}`}
          value={startTime || ''}
          onChange={(e) => onStartTimeChange(e.target.value)}
        >
          <option value="" disabled>Select start time</option>
          {timeOptions.map((option, index) => (
            <option key={`start-${index}`} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        {startTimeError && (
          <p className="text-xs text-destructive">{startTimeError}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="end-time" className={endTimeError ? "text-destructive" : ""}>End Time</Label>
        <select
          id="end-time"
          className={`w-full border rounded-md px-3 py-2 ${endTimeError ? "border-destructive" : "border-input"}`}
          value={endTime || ''}
          onChange={(e) => onEndTimeChange(e.target.value)}
        >
          <option value="" disabled>Select end time</option>
          {timeOptions.map((option, index) => (
            <option key={`end-${index}`} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        {endTimeError && (
          <p className="text-xs text-destructive">{endTimeError}</p>
        )}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
