
/**
 * Calculates the number of hours between two time strings
 * Format of time strings is expected to be "HH:MM" in 24-hour format
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let hours = endHour - startHour;
  let minutes = endMinute - startMinute;
  
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  
  if (hours < 0) {
    hours += 24; // Handle overnight shifts
  }
  
  const totalHours = hours + (minutes / 60);
  return totalHours;
};

/**
 * Formats time from 24-hour to 12-hour format with AM/PM
 */
export const formatTimeForDisplay = (time: string): string => {
  if (!time) return '';
  
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
};
