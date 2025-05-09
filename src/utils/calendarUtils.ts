/**
 * Calendar Utilities
 *
 * Helper functions for calendar operations
 */

import { ICalendarEventBase, CalendarDailyEvent, EntityType } from '@/types/unifiedCalendar';

/**
 * Expands a multi-day event into individual daily events
 *
 * @param event The original calendar event
 * @returns Array of daily events, or just the original event if it's a single day
 */
export function expandEventToDailyEvents(event: ICalendarEventBase): CalendarDailyEvent[] {
  // If no end date or same as start date, no expansion needed
  if (!event.end_datetime || event.start_datetime === event.end_datetime) {
    return [
      {
        ...event,
        day_number: 1,
        total_days: 1,
      },
    ];
  }

  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);

  // Calculate the number of days between start and end (inclusive)
  const days = getDaysBetween(startDate, endDate);

  // If it's a single day event, no expansion needed
  if (days <= 1) {
    return [
      {
        ...event,
        day_number: 1,
        total_days: 1,
      },
    ];
  }

  // Generate the date range (one event per day)
  const dateRange = generateDateRange(startDate, endDate);

  // Create an event for each day
  return dateRange.map((date, index) => {
    // Format the title to include day information
    const dailyTitle = event.is_all_day
      ? `${event.title} (Day ${index + 1}/${dateRange.length})`
      : event.title;

    return {
      ...event,
      id: event.id ? `${event.id}-day-${index + 1}` : '',
      title: dailyTitle,
      start_datetime: new Date(date).toISOString(),
      end_datetime: new Date(date).toISOString(),
      day_number: index + 1,
      total_days: dateRange.length,
      original_event_id: event.id,
    };
  });
}

/**
 * Calculates the number of days between two dates, inclusive
 *
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

  // Set times to midnight to avoid time zone issues
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  // Calculate difference in days and add 1 to include both start and end dates
  return Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay)) + 1;
}

/**
 * Generates an array of dates between start and end dates, inclusive
 *
 * @param startDate Start date
 * @param endDate End date
 * @returns Array of dates
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const lastDate = new Date(endDate);
  lastDate.setHours(0, 0, 0, 0);

  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

/**
 * Formats a calendar event title based on entity type
 *
 * @param entityType Type of entity (work_order, project, etc.)
 * @param title Base title
 * @param reference Reference number or ID (optional)
 * @returns Formatted title
 */
export function formatCalendarTitle(
  entityType: EntityType,
  title: string,
  reference?: string
): string {
  switch (entityType) {
    case 'work_order':
      return reference ? `WO-${reference} | ${title}` : title;
    case 'project':
      return reference ? `Project: ${reference} - ${title}` : `Project: ${title}`;
    case 'ad_hoc':
      return title;
    default:
      return title;
  }
}

/**
 * Checks if a Google event ID appears to be valid
 *
 * @param eventId Google Calendar event ID to check
 * @returns True if the ID appears valid
 */
export function isValidGoogleEventId(eventId: string | null | undefined): boolean {
  if (!eventId) return false;

  // Google Calendar event IDs are typically alphanumeric strings
  // with underscores, at least 10 characters long
  const validFormat = /^[a-zA-Z0-9_-]{10,}$/;
  return validFormat.test(eventId);
}

/**
 * Formats a date range as a string
 *
 * @param startDate Start date
 * @param endDate End date (optional)
 * @param allDay Whether the event is all day
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date, endDate?: Date | null, allDay = false): string {
  if (!endDate || startDate.toDateString() === endDate.toDateString()) {
    return allDay ? startDate.toLocaleDateString() : startDate.toLocaleString();
  }

  return allDay
    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    : `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
}
