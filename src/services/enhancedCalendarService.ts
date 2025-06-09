/**
 * Enhanced Calendar Service
 * Handles calendar event creation for various entity types
 */

import { createWorkOrderEvent } from '@/lib/calendarService';

export interface EnhancedCalendarEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  entityType: string;
  entityId: string;
  assignees?: Array<{
    type: string;
    id: string;
    email?: string;
  }>;
  userEmail?: string;
  sendNotifications?: boolean;
  projectId?: string;
  workOrderId?: string;
}

export interface CalendarSelectionInfo {
  primaryCalendar: {
    id: string;
    name: string;
  };
}

export interface EnhancedCalendarResult {
  success: boolean;
  primaryEventId?: string;
  calendarSelection?: CalendarSelectionInfo;
  error?: string;
}

export class EnhancedCalendarService {
  static async createEvent(eventData: EnhancedCalendarEventData): Promise<EnhancedCalendarResult> {
    console.log('🗓️ EnhancedCalendarService: Creating event for:', eventData.entityType);

    try {
      // For work orders, use the existing work order calendar function
      if (eventData.entityType === 'work_order' && eventData.workOrderId) {
        const googleEventId = await createWorkOrderEvent({
          work_order_id: eventData.workOrderId,
          title: eventData.title,
          description: eventData.description,
          scheduled_date: eventData.startTime,
          due_by_date: eventData.endTime,
          location: eventData.location,
        });

        return {
          success: true,
          primaryEventId: googleEventId,
          calendarSelection: {
            primaryCalendar: {
              id: import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER || 'work-orders',
              name: 'Work Orders Calendar',
            },
          },
        };
      }

      // Determine which shared calendar to use based on entity type
      let targetCalendarId: string;
      let calendarName: string;

      switch (eventData.entityType) {
        case 'schedule_item':
        case 'project':
        case 'project_milestone':
        case 'project_task':
          // All project-related items go to the shared projects calendar
          targetCalendarId =
            import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS ||
            import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT ||
            'primary';
          calendarName = 'Projects Calendar';
          if (
            !import.meta.env.VITE_GOOGLE_CALENDAR_PROJECTS &&
            !import.meta.env.VITE_GOOGLE_CALENDAR_PROJECT
          ) {
            console.warn(
              '⚠️ VITE_GOOGLE_CALENDAR_PROJECTS/PROJECT not configured, using primary calendar'
            );
          }
          break;

        case 'work_order':
          // Work orders go to the shared work orders calendar
          targetCalendarId = import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER || 'primary';
          calendarName = 'Work Orders Calendar';
          if (!import.meta.env.VITE_GOOGLE_CALENDAR_WORK_ORDER) {
            console.warn(
              '⚠️ VITE_GOOGLE_CALENDAR_WORK_ORDER not configured, using primary calendar'
            );
          }
          break;

        default:
          // Other entity types might need their own calendars in the future
          console.warn(
            `⚠️ No specific calendar configured for entity type: ${eventData.entityType}`
          );
          targetCalendarId = 'primary';
          calendarName = 'Primary Calendar';
      }

      console.log(`📅 Using ${calendarName} (${targetCalendarId}) for ${eventData.entityType}`);

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          calendarId: targetCalendarId,
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime || eventData.startTime,
          location: eventData.location,
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          projectId: eventData.projectId,
          assignees: eventData.assignees,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create calendar event:', errorText);

        // Parse error message if possible
        let errorMessage = 'Failed to create calendar event';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Use raw error text if not JSON
          errorMessage = errorText || errorMessage;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      const result = await response.json();
      console.log('Calendar event created successfully:', result);

      return {
        success: true,
        primaryEventId: result.event?.id,
        calendarSelection: {
          primaryCalendar: {
            id: targetCalendarId,
            name: calendarName,
          },
        },
      };
    } catch (error) {
      console.error('Error in EnhancedCalendarService:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  static getCalendarDisplayInfo(selection: any): string {
    return selection?.primaryCalendar?.name || 'Primary Calendar';
  }
}

// Re-export the event data type for backward compatibility
export type { EnhancedCalendarEventData as CalendarEventData };
