
// Generate time options for the time picker (in 15-minute intervals)
export const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  
  // Format the display value in 12-hour format
  const displayHour = hour % 12 || 12;
  const amPm = hour < 12 ? 'AM' : 'PM';
  const display = `${displayHour}:${minute.toString().padStart(2, '0')} ${amPm}`;
  
  // Determine time of day
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  return { value, display, timeOfDay };
});

// Calculate hours between two time strings (HH:MM format)
export function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) {
    return 0;
  }
  
  try {
    // Validate time format
    if (!startTime.match(/^\d{1,2}:\d{2}$/) || !endTime.match(/^\d{1,2}:\d{2}$/)) {
      console.error('Invalid time format, expected HH:MM', { startTime, endTime });
      return 0;
    }
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    // Validate the parsed values
    if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
      console.error('Failed to parse time components', { startTime, endTime });
      return 0;
    }
    
    // Convert to minutes and find the difference
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // If end time is before start time, assume it's the next day
    const minutesDiff = endTotalMinutes >= startTotalMinutes
      ? endTotalMinutes - startTotalMinutes
      : (24 * 60) - startTotalMinutes + endTotalMinutes;
    
    // Convert back to hours
    const hours = minutesDiff / 60;
    
    // Round to nearest 0.1
    return Math.round(hours * 10) / 10;
  } catch (error) {
    console.error('Error calculating hours:', error);
    return 0;
  }
}

// Group time entries by date
export function groupEntriesByDate(entries) {
  return entries.reduce((groups, entry) => {
    const date = entry.date_worked;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {});
}

// Format date for display (e.g., "Monday, Apr 15")
export function formatDateHeading(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// Format time for display (convert 24h format to 12h format)
export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  
  try {
    // Validate time format
    if (!timeStr.match(/^\d{1,2}:\d{2}$/)) {
      return timeStr; // Return original if not in expected format
    }
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // Validate parsed values
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return timeStr;
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error, timeStr);
    return timeStr;
  }
}

// Format hours worked into a human-readable duration
export function formatHoursToDuration(hours: number): string {
  if (hours === undefined || hours === null || isNaN(hours)) {
    return '0h';
  }
  
  const roundedHours = Math.floor(hours);
  const minutes = Math.round((hours - roundedHours) * 60);
  
  if (roundedHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${roundedHours}h`;
  } else {
    return `${roundedHours}h ${minutes}m`;
  }
}
