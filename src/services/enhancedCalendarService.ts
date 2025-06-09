/**
 * Stub for EnhancedCalendarService
 * This is a temporary replacement while we transition to the new calendar service
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
    console.warn('⚠️ Using stub EnhancedCalendarService - transitioning to new calendar service');

    try {
      // For work orders, use the new calendar service
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

      // For other entity types, return a mock success for now
      console.log('Mock calendar event creation for:', eventData.entityType);
      return {
        success: true,
        primaryEventId: `mock-event-${Date.now()}`,
        calendarSelection: {
          primaryCalendar: {
            id: 'primary',
            name: 'Primary Calendar',
          },
        },
        invitesSent: [],
      };
    } catch (error) {
      console.error('Error in EnhancedCalendarService stub:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  static getCalendarDisplayInfo(selection: any): string {
    return 'Primary Calendar';
  }
}

// Re-export the event data type for backward compatibility
export type { EnhancedCalendarEventData as CalendarEventData };
