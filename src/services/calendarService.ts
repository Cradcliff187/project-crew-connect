/**
 * Google Calendar API integration service
 */

import { toast } from '@/hooks/use-toast';
import { ScheduleItem, RecurrencePattern } from '@/types/schedule';

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

// Define the shape of the Google client interface
export interface GoogleCalendarClient {
  createEvent: (calendarId: string, event: GoogleCalendarEvent) => Promise<any>;
  updateEvent: (calendarId: string, eventId: string, event: GoogleCalendarEvent) => Promise<any>;
  deleteEvent: (calendarId: string, eventId: string) => Promise<any>;
  getEvent: (calendarId: string, eventId: string) => Promise<any>;
  syncEvents: (calendarId: string, syncToken?: string) => Promise<any>;
}

// Define the shape of a Google Calendar event
export interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  recurrence?: string[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
  location?: string;
}

// Calendar Service factory
export function createCalendarService(
  googleClient?: GoogleCalendarClient,
  options: { timeZone?: string; defaultCalendarId?: string } = {}
) {
  const { timeZone = 'America/New_York', defaultCalendarId = 'primary' } = options;

  // Helper to convert Recurrence pattern to Google Calendar RFC string
  const buildRecurrenceRule = (scheduleItem: ScheduleItem): string[] | undefined => {
    if (!scheduleItem.recurrence) return undefined;

    const { frequency, interval = 1, endDate, count, weekDays, monthDay } = scheduleItem.recurrence;

    let rule = 'RRULE:FREQ=';

    switch (frequency) {
      case 'daily':
        rule += 'DAILY';
        break;
      case 'weekly':
        rule += 'WEEKLY';
        if (weekDays && weekDays.length > 0) {
          rule += `;BYDAY=${weekDays.join(',')}`;
        }
        break;
      case 'monthly':
        rule += 'MONTHLY';
        if (monthDay) {
          rule += `;BYMONTHDAY=${monthDay}`;
        }
        break;
      case 'yearly':
        rule += 'YEARLY';
        break;
    }

    // Add interval if greater than 1
    if (interval > 1) {
      rule += `;INTERVAL=${interval}`;
    }

    // Add end parameters if present
    if (endDate) {
      const formattedDate = endDate.replace(/-/g, '');
      rule += `;UNTIL=${formattedDate}T235959Z`;
    } else if (count) {
      rule += `;COUNT=${count}`;
    }

    return [rule];
  };

  // Convert a schedule item to a Google Calendar event
  const scheduleItemToGoogleEvent = (scheduleItem: ScheduleItem): GoogleCalendarEvent => {
    const event: GoogleCalendarEvent = {
      summary: scheduleItem.title,
      description: scheduleItem.description || undefined,
      start: {
        timeZone,
      },
      end: {
        timeZone,
      },
    };

    // Handle all-day events
    if (scheduleItem.is_all_day) {
      // For all-day events, use 'date' format without time
      const startDate = scheduleItem.start_datetime.split('T')[0];
      const endDate = scheduleItem.end_datetime.split('T')[0];

      event.start.date = startDate;
      event.end.date = endDate;
    } else {
      // For time-specific events, use 'dateTime' format
      event.start.dateTime = scheduleItem.start_datetime;
      event.end.dateTime = scheduleItem.end_datetime;
    }

    // Add recurrence if defined
    const recurrence = buildRecurrenceRule(scheduleItem);
    if (recurrence) {
      event.recurrence = recurrence;
    }

    // Add attendees if there's an assignee
    if (scheduleItem.assignee_id && scheduleItem.send_invite) {
      // This would need to be expanded to fetch actual email addresses
      // For now, assuming assignee_id contains or maps to an email
      event.attendees = [
        {
          email: scheduleItem.assignee_id,
          responseStatus: 'needsAction',
        },
      ];
    }

    return event;
  };

  // Convert a Google Calendar event to a schedule item
  const googleEventToScheduleItem = (
    googleEvent: any,
    projectId: string,
    existingItem?: ScheduleItem
  ): Partial<ScheduleItem> => {
    const scheduleItem: Partial<ScheduleItem> = {
      ...existingItem,
      project_id: projectId,
      title: googleEvent.summary,
      description: googleEvent.description || null,
      google_event_id: googleEvent.id,
      invite_status: googleEvent.status || null,
    };

    // Handle dates based on whether it's an all-day event
    if (googleEvent.start.date) {
      // All-day event
      scheduleItem.is_all_day = true;
      scheduleItem.start_datetime = `${googleEvent.start.date}T00:00:00`;
      scheduleItem.end_datetime = `${googleEvent.end.date}T23:59:59`;
    } else {
      // Regular event with time
      scheduleItem.is_all_day = false;
      scheduleItem.start_datetime = googleEvent.start.dateTime;
      scheduleItem.end_datetime = googleEvent.end.dateTime;
    }

    // Handle attendees
    if (googleEvent.attendees && googleEvent.attendees.length > 0) {
      // In a real implementation, you'd need logic to map the email back to an assignee_id
      // This is simplified
      scheduleItem.send_invite = true;
    }

    // Handle recurrence
    if (googleEvent.recurrence && googleEvent.recurrence.length > 0) {
      // This would need a more complex parser for Google's RRULE format
      // Simplified version:
      const rruleStr = googleEvent.recurrence[0].replace('RRULE:', '');
      const rruleParts = rruleStr.split(';').reduce((acc: any, part: string) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
      }, {});

      const recurrence: Partial<RecurrencePattern> = {};

      // Map frequency
      switch (rruleParts.FREQ) {
        case 'DAILY':
          recurrence.frequency = 'daily';
          break;
        case 'WEEKLY':
          recurrence.frequency = 'weekly';
          if (rruleParts.BYDAY) {
            recurrence.weekDays = rruleParts.BYDAY.split(',');
          }
          break;
        case 'MONTHLY':
          recurrence.frequency = 'monthly';
          if (rruleParts.BYMONTHDAY) {
            recurrence.monthDay = parseInt(rruleParts.BYMONTHDAY, 10);
          }
          break;
        case 'YEARLY':
          recurrence.frequency = 'yearly';
          break;
      }

      // Map interval
      if (rruleParts.INTERVAL) {
        recurrence.interval = parseInt(rruleParts.INTERVAL, 10);
      }

      // Map end parameters
      if (rruleParts.UNTIL) {
        // Format: YYYYMMDD -> YYYY-MM-DD
        const untilDate = rruleParts.UNTIL.substring(0, 8);
        recurrence.endDate = `${untilDate.substring(0, 4)}-${untilDate.substring(
          4,
          6
        )}-${untilDate.substring(6, 8)}`;
      } else if (rruleParts.COUNT) {
        recurrence.count = parseInt(rruleParts.COUNT, 10);
      }

      scheduleItem.recurrence = recurrence as RecurrencePattern;
    }

    return scheduleItem;
  };

  // Calendar service implementation
  return {
    // Create or update a schedule item and sync with Google Calendar
    async createOrUpdateEvent(
      scheduleItem: ScheduleItem,
      calendarId = defaultCalendarId
    ): Promise<ScheduleItem> {
      if (!googleClient) {
        throw new Error('Google Calendar client not provided');
      }

      // If the schedule item should be synced to Google Calendar
      if (scheduleItem.calendar_integration_enabled) {
        try {
          const googleEvent = scheduleItemToGoogleEvent(scheduleItem);

          let response;
          if (scheduleItem.google_event_id) {
            // Update existing event
            response = await googleClient.updateEvent(
              calendarId,
              scheduleItem.google_event_id,
              googleEvent
            );
          } else {
            // Create new event
            response = await googleClient.createEvent(calendarId, googleEvent);
            scheduleItem.google_event_id = response.id;
          }

          // Update the invite status based on Google's response
          scheduleItem.invite_status = response.status || null;
          scheduleItem.last_sync_error = null;

          return scheduleItem;
        } catch (error: any) {
          console.error('Error syncing with Google Calendar:', error);
          scheduleItem.last_sync_error =
            error.message || 'Unknown error syncing with Google Calendar';
          throw error;
        }
      }

      return scheduleItem;
    },

    // Handle incoming updates from Google Calendar
    async handleGoogleWebhook(
      payload: any,
      projectId: string
    ): Promise<Partial<ScheduleItem> | null> {
      if (!googleClient) {
        throw new Error('Google Calendar client not provided');
      }

      try {
        const { calendarId, eventId, resourceState } = payload;

        // Skip if not an event update
        if (resourceState !== 'exists' || !eventId) {
          return null;
        }

        // Fetch the updated event from Google
        const googleEvent = await googleClient.getEvent(calendarId, eventId);

        // Convert it to a schedule item (partial)
        return googleEventToScheduleItem(googleEvent, projectId);
      } catch (error) {
        console.error('Error handling Google webhook:', error);
        return null;
      }
    },

    // Sync all events with Google Calendar (e.g., for initial load)
    async syncAllEvents(
      scheduleItems: ScheduleItem[],
      calendarId = defaultCalendarId
    ): Promise<ScheduleItem[]> {
      if (!googleClient) {
        throw new Error('Google Calendar client not provided');
      }

      // This would be implemented to perform a full sync
      // For simplicity, we're just syncing each item individually
      const updatedItems: ScheduleItem[] = [];

      for (const item of scheduleItems) {
        if (item.calendar_integration_enabled) {
          try {
            const updatedItem = await this.createOrUpdateEvent(item, calendarId);
            updatedItems.push(updatedItem);
          } catch (error) {
            console.error(`Error syncing item ${item.id}:`, error);
            updatedItems.push(item);
          }
        } else {
          updatedItems.push(item);
        }
      }

      return updatedItems;
    },

    // Delete a schedule item from Google Calendar
    async deleteEvent(
      scheduleItem: ScheduleItem,
      calendarId = defaultCalendarId
    ): Promise<boolean> {
      if (!googleClient || !scheduleItem.google_event_id) {
        return false;
      }

      try {
        await googleClient.deleteEvent(calendarId, scheduleItem.google_event_id);
        return true;
      } catch (error) {
        console.error('Error deleting event from Google Calendar:', error);
        return false;
      }
    },

    // Utility function - not using any external dependencies
    scheduleItemToGoogleEvent,
    googleEventToScheduleItem,
  };
}

// Default export - with no client, for standalone usage
export default createCalendarService();
