/**
 * Enhanced Calendar Service
 *
 * Handles both group calendar events and individual invites intelligently
 * Uses CalendarSelectionService to determine appropriate calendars
 */

import {
  CalendarSelectionService,
  CalendarSelectionContext,
  CalendarSelection,
} from './calendarSelectionService';

export interface EnhancedCalendarEventData {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;

  // Entity context
  entityType: CalendarSelectionContext['entityType'];
  entityId: string;
  projectId?: string;
  workOrderId?: string;

  // Assignee/attendee information
  assignees?: {
    type: 'employee' | 'subcontractor';
    id: string;
    email?: string;
  }[];

  // User context
  userEmail?: string;

  // Options
  sendNotifications?: boolean;
  timezone?: string;
}

export interface CalendarEventResult {
  success: boolean;
  primaryEventId?: string;
  additionalEventIds?: string[];
  invitesSent?: string[];
  errors?: string[];
  calendarSelection?: CalendarSelection;
}

export class EnhancedCalendarService {
  private static readonly API_BASE_URL = '';

  /**
   * Create a calendar event using intelligent calendar selection
   */
  static async createEvent(eventData: EnhancedCalendarEventData): Promise<CalendarEventResult> {
    try {
      // Step 1: Determine calendar selection strategy
      const context: CalendarSelectionContext = {
        entityType: eventData.entityType,
        projectId: eventData.projectId,
        workOrderId: eventData.workOrderId,
        assignees: eventData.assignees,
        userEmail: eventData.userEmail,
      };

      const calendarSelection = await CalendarSelectionService.selectCalendars(context);

      // Step 2: Create primary event on group/main calendar
      const primaryResult = await this.createPrimaryEvent(eventData, calendarSelection);

      if (!primaryResult.success) {
        return {
          success: false,
          errors: [`Failed to create primary event: ${primaryResult.error}`],
          calendarSelection,
        };
      }

      const result: CalendarEventResult = {
        success: true,
        primaryEventId: primaryResult.eventId,
        additionalEventIds: [],
        invitesSent: [],
        calendarSelection,
      };

      // Step 3: Create events on additional calendars if needed
      if (calendarSelection.additionalCalendars) {
        for (const additionalCalendar of calendarSelection.additionalCalendars) {
          try {
            const additionalResult = await this.createAdditionalEvent(
              eventData,
              additionalCalendar.id,
              primaryResult.eventId
            );

            if (additionalResult.success && additionalResult.eventId) {
              result.additionalEventIds!.push(additionalResult.eventId);
            }
          } catch (error) {
            console.warn(
              `Failed to create event on additional calendar ${additionalCalendar.name}:`,
              error
            );
            // Don't fail the entire operation for additional calendars
          }
        }
      }

      // Step 4: Send individual invites
      if (calendarSelection.individualInvites.length > 0) {
        for (const invite of calendarSelection.individualInvites) {
          try {
            const inviteResult = await this.sendIndividualInvite(
              eventData,
              invite,
              primaryResult.eventId
            );

            if (inviteResult.success) {
              result.invitesSent!.push(invite.email);
            }
          } catch (error) {
            console.warn(`Failed to send invite to ${invite.email}:`, error);
            // Don't fail the entire operation for individual invites
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error in enhanced calendar service:', error);
      return {
        success: false,
        errors: [
          `Enhanced calendar service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Update an existing event across all calendars
   */
  static async updateEvent(
    eventId: string,
    eventData: Partial<EnhancedCalendarEventData>,
    originalCalendarSelection?: CalendarSelection
  ): Promise<CalendarEventResult> {
    // Implementation for updating events across multiple calendars
    // This would involve updating the primary event and syncing changes to additional calendars
    throw new Error('Update event not yet implemented');
  }

  /**
   * Delete an event from all calendars
   */
  static async deleteEvent(
    eventId: string,
    calendarSelection?: CalendarSelection
  ): Promise<CalendarEventResult> {
    // Implementation for deleting events from multiple calendars
    throw new Error('Delete event not yet implemented');
  }

  /**
   * Create the primary event on the main calendar
   */
  private static async createPrimaryEvent(
    eventData: EnhancedCalendarEventData,
    calendarSelection: CalendarSelection
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          location: eventData.location,
          calendarId: calendarSelection.primaryCalendar.id,
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          sendNotifications: false, // We handle invites separately
          timezone: eventData.timezone || 'America/New_York',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return {
        success: true,
        eventId: result.eventId || result.event?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create event on additional calendar (e.g., work order also goes to project calendar)
   */
  private static async createAdditionalEvent(
    eventData: EnhancedCalendarEventData,
    calendarId: string,
    primaryEventId: string
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      // Similar to createPrimaryEvent but for additional calendars
      const response = await fetch(`${this.API_BASE_URL}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: `${eventData.title} (Related)`,
          description: `${eventData.description || ''}\n\nRelated to primary event: ${primaryEventId}`,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          location: eventData.location,
          calendarId: calendarId,
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          sendNotifications: false,
          timezone: eventData.timezone || 'America/New_York',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return {
        success: true,
        eventId: result.eventId || result.event?.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send individual calendar invite to assignee/attendee
   */
  private static async sendIndividualInvite(
    eventData: EnhancedCalendarEventData,
    invite: CalendarSelection['individualInvites'][0],
    primaryEventId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Create an invite event on the individual's calendar
      const response = await fetch(`${this.API_BASE_URL}/api/calendar/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          location: eventData.location,
          attendeeEmail: invite.email,
          attendeeRole: invite.role,
          attendeeType: invite.type,
          primaryEventId: primaryEventId,
          entityType: eventData.entityType,
          entityId: eventData.entityId,
          sendNotifications: eventData.sendNotifications !== false,
          timezone: eventData.timezone || 'America/New_York',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get calendar information for display in UI
   */
  static getCalendarDisplayInfo(calendarSelection: CalendarSelection): {
    primary: string;
    additional: string[];
    invites: string[];
  } {
    return {
      primary: `${calendarSelection.primaryCalendar.name} (${calendarSelection.primaryCalendar.type})`,
      additional: calendarSelection.additionalCalendars?.map(cal => cal.name) || [],
      invites: calendarSelection.individualInvites.map(
        invite => `${invite.email} (${invite.role})`
      ),
    };
  }

  /**
   * Validate configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    return CalendarSelectionService.validateConfiguration();
  }
}
