
/**
 * Calculates the hours between two time strings in 24-hour format (HH:MM)
 * @param startTime - Start time in format "HH:MM" or "HH:MM:SS"
 * @param endTime - End time in format "HH:MM" or "HH:MM:SS"
 * @returns Number of hours as a decimal
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  // Extract hours and minutes from the time strings
  const [startHourStr, startMinStr] = startTime.split(':');
  const [endHourStr, endMinStr] = endTime.split(':');
  
  if (!startHourStr || !startMinStr || !endHourStr || !endMinStr) {
    throw new Error('Invalid time format. Expected HH:MM or HH:MM:SS');
  }
  
  let startHour = parseInt(startHourStr, 10);
  const startMin = parseInt(startMinStr, 10);
  
  let endHour = parseInt(endHourStr, 10);
  const endMin = parseInt(endMinStr, 10);
  
  // Convert hours and minutes to total minutes
  let startTotalMinutes = startHour * 60 + startMin;
  let endTotalMinutes = endHour * 60 + endMin;
  
  // Handle crossing midnight
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add a full day of minutes
  }
  
  // Calculate the difference in minutes
  const diffMinutes = endTotalMinutes - startTotalMinutes;
  
  // Convert back to hours
  return diffMinutes / 60;
};

/**
 * Parse time string to Date object
 * @param timeString - Time in format "HH:MM" or "HH:MM:SS"
 * @returns Date object with the time set
 */
export const parseTime = (timeString: string): Date => {
  const today = new Date();
  const [hours, minutes] = timeString.split(':');
  today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
  return today;
};

/**
 * Format time string to 12-hour format with AM/PM
 * @param timeString - Time in format "HH:MM" or "HH:MM:SS"
 * @returns Formatted time string (e.g. "3:30 PM")
 */
export const formatTime = (timeString: string): string => {
  const date = parseTime(timeString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

/**
 * Determine the time of day based on the hour
 * @param hour - Hour in 24-hour format (0-23)
 * @returns Time of day category
 */
export const getTimeOfDay = (hour: number): 'morning' | 'afternoon' | 'evening' | 'night' => {
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 17) {
    return 'afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
};

/**
 * Generate time options for dropdowns with 15-minute intervals
 * @returns Array of time options
 */
export const timeOptions = (): Array<{value: string, display: string}> => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const date = parseTime(timeValue);
      const timeDisplay = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      options.push({ value: timeValue, display: timeDisplay });
    }
  }
  return options;
};

/**
 * Format hours with proper decimal places
 * @param hours - Number of hours
 * @param decimalPlaces - Number of decimal places to display
 * @returns Formatted hours string
 */
export const formatHours = (hours: number, decimalPlaces: number = 1): string => {
  return hours.toFixed(decimalPlaces);
};

/**
 * Create standardized time display for start/end times
 * @param startTime - Start time in format "HH:MM"
 * @param endTime - End time in format "HH:MM"
 * @returns Formatted time range string (e.g. "9:00 AM - 5:00 PM")
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Get current time in HH:MM format
 * @returns Current time in format "HH:MM"
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Round time to nearest interval (e.g. 15 minutes)
 * @param timeString - Time in format "HH:MM"
 * @param intervalMinutes - Interval to round to in minutes
 * @returns Rounded time in format "HH:MM"
 */
export const roundTimeToInterval = (timeString: string, intervalMinutes: number = 15): string => {
  const [hourStr, minuteStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  const totalMinutes = hour * 60 + minute;
  const roundedMinutes = Math.round(totalMinutes / intervalMinutes) * intervalMinutes;
  
  const newHour = Math.floor(roundedMinutes / 60) % 24;
  const newMinute = roundedMinutes % 60;
  
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
};
