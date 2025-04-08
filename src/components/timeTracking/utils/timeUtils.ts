
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
