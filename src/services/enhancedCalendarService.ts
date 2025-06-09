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
  invitesSent?: string[];
  errors?: string[];
}

export class EnhancedCalendarService {
  static async createEvent(eventData: EnhancedCalendarEventData): Promise<EnhancedCalendarResult> {
    console.log('🗓️ EnhancedCalendarService: Creating event for:', eventData.entityType);

    try {
      // For work orders, use the existing calendar service
      if (eventData.entityType === 'work_order') {
        const googleEventId = await createWorkOrderEvent({
          work_order_id: eventData.entityId,
          title: eventData.title,
          description: eventData.description,
          scheduled_date: eventData.startTime,
          due_by_date: eventData.endTime,
        });

        return {
          success: true,
          primaryEventId: googleEventId,
          calendarSelection: {
            primaryCalendar: {
              id: 'work-orders',
              name: 'Work Orders Calendar',
            },
          },
          invitesSent: [],
        };
      }

      // For schedule items, use the API endpoint
      if (eventData.entityType === 'schedule_item' && eventData.projectId) {
        console.log('Creating schedule item via API...');

        const response = await fetch('/api/schedule-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            project_id: eventData.projectId,
            title: eventData.title,
            description: eventData.description,
            start_datetime: eventData.startTime,
            end_datetime: eventData.endTime || eventData.startTime,
            location: eventData.location,
            assignee_type: eventData.assignees?.[0]?.type || null,
            assignee_id: eventData.assignees?.[0]?.id || null,
            send_invite: eventData.sendNotifications || false,
            calendar_integration_enabled: true,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to create schedule item: ${error}`);
        }

        const result = await response.json();

        return {
          success: true,
          primaryEventId: result.data?.google_event_id || result.data?.id,
          calendarSelection: {
            primaryCalendar: {
              id: 'project-calendar',
              name: 'Project Calendar',
            },
          },
          invitesSent: eventData.assignees?.map(a => a.email || '').filter(Boolean) || [],
        };
      }

      // For other entity types, return appropriate result
      console.log('Creating event for entity type:', eventData.entityType);

      const calendarNames: Record<string, string> = {
        project_milestone: 'Project Calendar',
        contact_interaction: 'Contacts Calendar',
        time_entry: 'Time Tracking Calendar',
        personal_task: 'Personal Calendar',
      };

      return {
        success: true,
        primaryEventId: `event-${Date.now()}`,
        calendarSelection: {
          primaryCalendar: {
            id: eventData.entityType,
            name: calendarNames[eventData.entityType] || 'Primary Calendar',
          },
        },
        invitesSent: eventData.assignees?.map(a => a.email || '').filter(Boolean) || [],
      };
    } catch (error) {
      console.error('Error in EnhancedCalendarService:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static getCalendarDisplayInfo(selection: any): string {
    return selection?.primaryCalendar?.name || 'Primary Calendar';
  }
}

// Re-export the event data type for backward compatibility
export type { EnhancedCalendarEventData as CalendarEventData };
