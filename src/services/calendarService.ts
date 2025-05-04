/**
 * Google Calendar API integration service
 */

import { toast } from '@/hooks/use-toast';

export interface CalendarEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  entityType:
    | 'project_milestone'
    | 'work_order'
    | 'contact_interaction'
    | 'estimate'
    | 'time_entry';
  entityId: string;
  sendNotifications?: boolean;
  calendarId?: string;
  // Additional fields for specific event types
  projectId?: string;
  contactName?: string;
  duration?: number;
  date?: string;
  employeeName?: string;
  attendees?: string[];
}

/**
 * Fetches calendar events from Google Calendar
 * @param options Optional parameters for filtering events
 */
export async function fetchCalendarEvents(
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  } = {}
) {
  const queryParams = new URLSearchParams();

  if (options.timeMin) queryParams.append('timeMin', options.timeMin);
  if (options.timeMax) queryParams.append('timeMax', options.timeMax);
  if (options.maxResults) queryParams.append('maxResults', options.maxResults.toString());

  const response = await fetch(
    `http://localhost:3000/api/calendar/events?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Creates a new calendar event using the provided data
 * @param eventData - The data for the calendar event to create
 * @returns The created calendar event data
 */
export async function createCalendarEvent(eventData: CalendarEventData) {
  try {
    const response = await fetch(`http://localhost:3000/api/calendar/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create calendar event');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating calendar event:', error);
    toast({
      title: 'Calendar error',
      description: error.message || 'Failed to create calendar event',
      variant: 'destructive',
    });
    throw error;
  }
}

/**
 * Creates a calendar event for a project milestone
 */
export async function createMilestoneEvent(
  milestoneId: string,
  data: {
    projectId: string;
    title: string;
    description?: string;
    dueDate: string;
  }
) {
  const response = await fetch(`http://localhost:3000/api/calendar/milestones/${milestoneId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create milestone event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Creates a calendar event for a work order
 */
export async function createWorkOrderEvent(
  workOrderId: string,
  data: {
    title: string;
    description?: string;
    scheduledDate: string;
    dueByDate?: string;
    location?: string;
  }
) {
  const response = await fetch(`http://localhost:3000/api/calendar/workorders/${workOrderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create work order event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Creates a calendar event for a contact meeting
 */
export async function createContactMeetingEvent(
  interactionId: string,
  data: {
    contactName: string;
    subject: string;
    notes?: string;
    scheduledDate: string;
    duration?: number;
    location?: string;
  }
) {
  const response = await fetch(
    `http://localhost:3000/api/calendar/contacts/meetings/${interactionId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create meeting event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Creates a calendar event for a time entry
 */
export async function createTimeEntryEvent(
  timeEntryId: string,
  data: {
    title: string;
    description?: string;
    workDate: string;
    startTime: string;
    endTime: string;
    employeeName?: string;
    projectId?: string;
  }
) {
  const response = await fetch(`http://localhost:3000/api/calendar/timeentries/${timeEntryId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to create time entry event: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Updates an existing calendar event
 * @param eventId - The ID of the event to update
 * @param eventData - The updated event data
 * @returns The updated calendar event data
 */
export async function updateCalendarEvent(eventId: string, eventData: Partial<CalendarEventData>) {
  try {
    const response = await fetch(`http://localhost:3000/api/calendar/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update calendar event');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error updating calendar event:', error);
    toast({
      title: 'Calendar error',
      description: error.message || 'Failed to update calendar event',
      variant: 'destructive',
    });
    throw error;
  }
}

/**
 * Deletes a calendar event
 * @param eventId - The ID of the event to delete
 */
export async function deleteCalendarEvent(eventId: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/calendar/events/${eventId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete calendar event');
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting calendar event:', error);
    toast({
      title: 'Calendar error',
      description: error.message || 'Failed to delete calendar event',
      variant: 'destructive',
    });
    throw error;
  }
}
