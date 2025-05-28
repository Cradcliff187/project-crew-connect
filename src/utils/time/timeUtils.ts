// Time utility functions for the application

export interface TimeOfDay {
  hours: number;
  minutes: number;
}

/**
 * Format time string (HH:MM) for display
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';

  // Handle different time formats
  if (timeString.includes(':')) {
    return timeString;
  }

  // If it's just a number, assume it's hours
  const hours = parseInt(timeString);
  if (!isNaN(hours)) {
    return `${hours.toString().padStart(2, '0')}:00`;
  }

  return timeString;
};

/**
 * Format hours to duration string (e.g., "2.5 hours")
 */
export const formatHoursToDuration = (hours: number): string => {
  if (hours === 0) return '0 hours';
  if (hours === 1) return '1 hour';
  return `${hours.toFixed(1)} hours`;
};

/**
 * Calculate hours between start and end time
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;

  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);

  if (!start || !end) return 0;

  const startMinutes = start.hours * 60 + start.minutes;
  let endMinutes = end.hours * 60 + end.minutes;

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diffMinutes = endMinutes - startMinutes;
  return diffMinutes / 60;
};

/**
 * Parse time string to TimeOfDay object
 */
export const parseTimeString = (timeString: string): TimeOfDay | null => {
  if (!timeString) return null;

  const parts = timeString.split(':');
  if (parts.length !== 2) return null;

  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);

  if (isNaN(hours) || isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
};

/**
 * Convert TimeOfDay to string
 */
export const timeToString = (time: TimeOfDay): string => {
  return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
};

/**
 * Get current time as string
 */
export const getCurrentTimeString = (): string => {
  const now = new Date();
  return timeToString({
    hours: now.getHours(),
    minutes: now.getMinutes(),
  });
};

/**
 * Validate time string format
 */
export const isValidTimeString = (timeString: string): boolean => {
  return parseTimeString(timeString) !== null;
};
