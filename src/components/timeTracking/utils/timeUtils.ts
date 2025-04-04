
import { format, parse } from 'date-fns';
import { TimeOfDay } from '@/types/timeTracking';

// Parse a time string into a Date object for easier formatting
export const parseTime = (timeStr: string): Date => {
  return parse(timeStr, 'HH:mm', new Date());
};

// Determine the time of day category
export const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Generate time options for the 24-hour day in 15-minute increments
export const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = format(parseTime(timeValue), 'h:mm a');
      options.push({
        value: timeValue,
        display: displayTime,
        timeOfDay: getTimeOfDay(hour)
      });
    }
  }
  return options;
};

export const timeOptions = generateTimeOptions();

// Format the time from 24h to 12h
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Calculate hours between start and end time
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  let hours = endHours - startHours;
  let minutes = endMinutes - startMinutes;
  
  // Handle negative minutes
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  
  // Handle overnight shifts
  if (hours < 0) {
    hours += 24;
  }
  
  return hours + (minutes / 60);
};
