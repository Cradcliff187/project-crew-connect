
/**
 * Calculate hours worked between two time strings
 * @param startTime Time string in format "HH:MM"
 * @param endTime Time string in format "HH:MM"
 * @returns Number of hours worked (rounded to 2 decimal places)
 */
export const calculateHoursWorked = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let hours = endHour - startHour;
  const minutes = endMinute - startMinute;
  
  if (hours < 0) hours += 24;
  
  return Math.round((hours + minutes / 60) * 100) / 100;
};
