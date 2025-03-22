
import React from 'react';
import { Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { calculateHoursWorked } from '@/lib/utils';
import { TimeOption, TimeOfDay } from '@/types/timeTracking';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

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
  // Format a 24h time string to 12h format with AM/PM
  const formatTime = (time: string): string => {
    if (!time) return '';
    
    const [hoursStr, minutesStr] = time.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = minutesStr.padStart(2, '0');
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes} ${period}`;
  };
  
  // Determine time of day category
  const getTimeOfDay = (hours: number): TimeOfDay => {
    if (hours >= 5 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 17) return 'afternoon';
    if (hours >= 17 && hours < 21) return 'evening';
    return 'night';
  };
  
  // Generate time options in 15-minute increments, grouped by time of day
  const generateTimeOptions = (): TimeOption[] => {
    const options: TimeOption[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const value = `${formattedHour}:${formattedMinute}`;
        const timeOfDay = getTimeOfDay(hour);
        
        options.push({
          value,
          display: formatTime(value),
          timeOfDay
        });
      }
    }
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  // Get valid end times (must be after start time)
  const getValidEndTimes = (): TimeOption[] => {
    if (!startTime) return timeOptions;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTotalMinutes = (startHour * 60) + startMinute;
    
    return timeOptions.filter(option => {
      const [endHour, endMinute] = option.value.split(':').map(Number);
      const endTotalMinutes = (endHour * 60) + endMinute;
      
      // Allow overnight shifts (if end time is earlier than start time, assume it's the next day)
      return endTotalMinutes > startTotalMinutes || endTotalMinutes < startTotalMinutes - 120;
    });
  };
  
  // Display time duration between start and end times
  const getTimeDuration = (): string => {
    if (!startTime || !endTime) return '';
    
    const hours = calculateHoursWorked(startTime, endTime);
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
    } else {
      return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startTime">Start Time</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Select
            value={startTime}
            onValueChange={onStartTimeChange}
          >
            <SelectTrigger id="startTime" className="w-full pl-9 bg-white">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-blue-600">Morning (5 AM - 12 PM)</SelectLabel>
                {timeOptions
                  .filter(time => time.timeOfDay === 'morning')
                  .map((time) => (
                    <SelectItem 
                      key={`start-${time.value}`} 
                      value={time.value}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      {time.display}
                    </SelectItem>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-amber-600 mt-2">Afternoon (12 PM - 5 PM)</SelectLabel>
                {timeOptions
                  .filter(time => time.timeOfDay === 'afternoon')
                  .map((time) => (
                    <SelectItem 
                      key={`start-${time.value}`} 
                      value={time.value}
                      className="hover:bg-amber-50 transition-colors"
                    >
                      {time.display}
                    </SelectItem>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-purple-600 mt-2">Evening (5 PM - 9 PM)</SelectLabel>
                {timeOptions
                  .filter(time => time.timeOfDay === 'evening')
                  .map((time) => (
                    <SelectItem 
                      key={`start-${time.value}`} 
                      value={time.value}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      {time.display}
                    </SelectItem>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-slate-600 mt-2">Night (9 PM - 5 AM)</SelectLabel>
                {timeOptions
                  .filter(time => time.timeOfDay === 'night')
                  .map((time) => (
                    <SelectItem 
                      key={`start-${time.value}`} 
                      value={time.value}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {time.display}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {startTimeError && (
          <p className="text-sm text-red-500">{startTimeError}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endTime">End Time</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Select
            value={endTime}
            onValueChange={onEndTimeChange}
          >
            <SelectTrigger id="endTime" className="w-full pl-9 bg-white">
              <SelectValue placeholder="Select end time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-blue-600">Morning (5 AM - 12 PM)</SelectLabel>
                {getValidEndTimes()
                  .filter(time => time.timeOfDay === 'morning')
                  .map((time) => (
                    <HoverCard key={`end-hover-${time.value}`}>
                      <HoverCardTrigger asChild>
                        <SelectItem 
                          key={`end-${time.value}`} 
                          value={time.value}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          {time.display}
                        </SelectItem>
                      </HoverCardTrigger>
                      {startTime && (
                        <HoverCardContent className="w-auto p-2">
                          <p className="text-xs">
                            Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                          </p>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-amber-600 mt-2">Afternoon (12 PM - 5 PM)</SelectLabel>
                {getValidEndTimes()
                  .filter(time => time.timeOfDay === 'afternoon')
                  .map((time) => (
                    <HoverCard key={`end-hover-${time.value}`}>
                      <HoverCardTrigger asChild>
                        <SelectItem 
                          key={`end-${time.value}`} 
                          value={time.value}
                          className="hover:bg-amber-50 transition-colors"
                        >
                          {time.display}
                        </SelectItem>
                      </HoverCardTrigger>
                      {startTime && (
                        <HoverCardContent className="w-auto p-2">
                          <p className="text-xs">
                            Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                          </p>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-purple-600 mt-2">Evening (5 PM - 9 PM)</SelectLabel>
                {getValidEndTimes()
                  .filter(time => time.timeOfDay === 'evening')
                  .map((time) => (
                    <HoverCard key={`end-hover-${time.value}`}>
                      <HoverCardTrigger asChild>
                        <SelectItem 
                          key={`end-${time.value}`} 
                          value={time.value}
                          className="hover:bg-purple-50 transition-colors"
                        >
                          {time.display}
                        </SelectItem>
                      </HoverCardTrigger>
                      {startTime && (
                        <HoverCardContent className="w-auto p-2">
                          <p className="text-xs">
                            Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                          </p>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs font-medium text-slate-600 mt-2">Night (9 PM - 5 AM)</SelectLabel>
                {getValidEndTimes()
                  .filter(time => time.timeOfDay === 'night')
                  .map((time) => (
                    <HoverCard key={`end-hover-${time.value}`}>
                      <HoverCardTrigger asChild>
                        <SelectItem 
                          key={`end-${time.value}`} 
                          value={time.value}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          {time.display}
                        </SelectItem>
                      </HoverCardTrigger>
                      {startTime && (
                        <HoverCardContent className="w-auto p-2">
                          <p className="text-xs">
                            Duration: {calculateHoursWorked(startTime, time.value).toFixed(2)} hours
                          </p>
                        </HoverCardContent>
                      )}
                    </HoverCard>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {endTimeError && (
          <p className="text-sm text-red-500">{endTimeError}</p>
        )}
      </div>
    </div>
  );
};

export default TimeRangeSelector;
