
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
