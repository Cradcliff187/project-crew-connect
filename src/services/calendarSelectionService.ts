/**
 * Calendar Selection Service
 *
 * Intelligently determines which calendar(s) to use based on:
 * - Entity type (project, work order, personal, etc.)
 * - Context (within project, standalone, etc.)
 * - User preferences
 * - Assignee information
 */

export interface CalendarSelectionContext {
  entityType:
    | 'project_milestone'
    | 'schedule_item'
    | 'work_order'
    | 'contact_interaction'
    | 'time_entry'
    | 'personal_task';
  projectId?: string;
  workOrderId?: string;
  assignees?: {
    type: 'employee' | 'subcontractor';
    id: string;
    email?: string;
  }[];
  userId?: string;
  userEmail?: string;
}

export interface CalendarSelection {
  // Primary calendar for the event (where the main event is created)
  primaryCalendar: {
    id: string;
    type: 'group' | 'personal';
    name: string;
  };

  // Individual invites to send (for personal calendars)
  individualInvites: {
    email: string;
    role: 'assignee' | 'attendee' | 'owner';
    type: 'employee' | 'subcontractor' | 'client';
  }[];

  // Additional group calendars to also create events on
  additionalCalendars?: {
    id: string;
    type: 'group';
    name: string;
    reason: string;
  }[];
}

// Frontend-compatible calendar configuration
interface CalendarConfig {
  PROJECT: string;
  WORK_ORDER: string;
  ADHOC: string;
}

export class CalendarSelectionService {
  // Get calendar configuration from backend API (since env vars aren't available in frontend)
  private static async getCalendarConfig(): Promise<CalendarConfig> {
    try {
      const response = await fetch('/api/calendar/config', {
        credentials: 'include',
      });

      if (!response.ok) {
        console.warn('Failed to fetch calendar config from backend, using fallback');
        // Fallback configuration
        return {
          PROJECT:
            'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com',
          WORK_ORDER:
            'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com',
          ADHOC: 'primary',
        };
      }

      const config = await response.json();
      return {
        PROJECT: config.GOOGLE_CALENDAR_PROJECT || 'primary',
        WORK_ORDER: config.GOOGLE_CALENDAR_WORK_ORDER || 'primary',
        ADHOC: 'primary',
      };
    } catch (error) {
      console.error('Error fetching calendar config:', error);
      // Return hardcoded fallback
      return {
        PROJECT:
          'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com',
        WORK_ORDER:
          'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com',
        ADHOC: 'primary',
      };
    }
  }

  /**
   * Main method to determine calendar selection strategy
   */
  static async selectCalendars(context: CalendarSelectionContext): Promise<CalendarSelection> {
    const { entityType, projectId, workOrderId, assignees = [], userEmail } = context;
    const calendarIds = await this.getCalendarConfig();

    switch (entityType) {
      case 'project_milestone':
      case 'schedule_item':
        return this.selectProjectCalendars(projectId, assignees, userEmail, calendarIds);

      case 'work_order':
        return this.selectWorkOrderCalendars(
          workOrderId,
          projectId,
          assignees,
          userEmail,
          calendarIds
        );

      case 'contact_interaction':
        return this.selectContactCalendars(projectId, assignees, userEmail, calendarIds);

      case 'time_entry':
        return this.selectTimeEntryCalendars(projectId, assignees, userEmail, calendarIds);

      case 'personal_task':
        return this.selectPersonalCalendars(userEmail, assignees, calendarIds);

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  /**
   * Project-related events: Use project group calendar + individual invites
   */
  private static selectProjectCalendars(
    projectId?: string,
    assignees: CalendarSelectionContext['assignees'] = [],
    userEmail?: string,
    calendarIds: CalendarConfig = { PROJECT: 'primary', WORK_ORDER: 'primary', ADHOC: 'primary' }
  ): CalendarSelection {
    return {
      primaryCalendar: {
        id: calendarIds.PROJECT,
        type: 'group',
        name: 'AJC Projects Calendar',
      },
      individualInvites: [
        // Add user as owner
        ...(userEmail
          ? [
              {
                email: userEmail,
                role: 'owner' as const,
                type: 'employee' as const,
              },
            ]
          : []),
        // Add assignees
        ...assignees
          .filter(assignee => assignee.email)
          .map(assignee => ({
            email: assignee.email!,
            role: 'assignee' as const,
            type: assignee.type,
          })),
      ],
    };
  }

  /**
   * Work Order events: Use work order group calendar + individual invites
   */
  private static selectWorkOrderCalendars(
    workOrderId?: string,
    projectId?: string,
    assignees: CalendarSelectionContext['assignees'] = [],
    userEmail?: string,
    calendarIds: CalendarConfig = { PROJECT: 'primary', WORK_ORDER: 'primary', ADHOC: 'primary' }
  ): CalendarSelection {
    // Work orders are completely separate from projects - only use Work Orders calendar
    const selection: CalendarSelection = {
      primaryCalendar: {
        id: calendarIds.WORK_ORDER,
        type: 'group',
        name: 'Work Orders Calendar',
      },
      individualInvites: [
        // Add user as owner
        ...(userEmail
          ? [
              {
                email: userEmail,
                role: 'owner' as const,
                type: 'employee' as const,
              },
            ]
          : []),
        // Add assignees (typically technicians)
        ...assignees
          .filter(assignee => assignee.email)
          .map(assignee => ({
            email: assignee.email!,
            role: 'assignee' as const,
            type: assignee.type,
          })),
      ],
    };

    // Work orders do NOT go to project calendars - they are separate service lines
    // Remove the additional calendars logic entirely

    return selection;
  }

  /**
   * Contact interactions: Context-dependent calendar selection
   */
  private static selectContactCalendars(
    projectId?: string,
    assignees: CalendarSelectionContext['assignees'] = [],
    userEmail?: string,
    calendarIds: CalendarConfig = { PROJECT: 'primary', WORK_ORDER: 'primary', ADHOC: 'primary' }
  ): CalendarSelection {
    // If project-related, use project calendar
    if (projectId) {
      return this.selectProjectCalendars(projectId, assignees, userEmail, calendarIds);
    }

    // Otherwise, use personal calendar
    return this.selectPersonalCalendars(userEmail, assignees, calendarIds);
  }

  /**
   * Time entries: Use project calendar if project-related, otherwise personal
   */
  private static selectTimeEntryCalendars(
    projectId?: string,
    assignees: CalendarSelectionContext['assignees'] = [],
    userEmail?: string,
    calendarIds: CalendarConfig = { PROJECT: 'primary', WORK_ORDER: 'primary', ADHOC: 'primary' }
  ): CalendarSelection {
    if (projectId) {
      return this.selectProjectCalendars(projectId, assignees, userEmail, calendarIds);
    }

    return this.selectPersonalCalendars(userEmail, assignees, calendarIds);
  }

  /**
   * Personal tasks: Use user's personal calendar
   */
  private static selectPersonalCalendars(
    userEmail?: string,
    assignees: CalendarSelectionContext['assignees'] = [],
    calendarIds: CalendarConfig = { PROJECT: 'primary', WORK_ORDER: 'primary', ADHOC: 'primary' }
  ): CalendarSelection {
    return {
      primaryCalendar: {
        id: calendarIds.ADHOC,
        type: 'personal',
        name: 'Personal Calendar',
      },
      individualInvites: [
        // Add assignees if any
        ...assignees
          .filter(assignee => assignee.email)
          .map(assignee => ({
            email: assignee.email!,
            role: 'attendee' as const,
            type: assignee.type,
          })),
      ],
    };
  }

  /**
   * Validate that required calendar IDs are configured
   */
  static async validateConfiguration(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const config = await this.getCalendarConfig();

      if (!config.PROJECT || config.PROJECT === 'primary') {
        errors.push('PROJECT calendar configuration is missing or using fallback');
      }

      if (!config.WORK_ORDER || config.WORK_ORDER === 'primary') {
        errors.push('WORK_ORDER calendar configuration is missing or using fallback');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          `Failed to validate configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  /**
   * Get calendar display information for UI
   */
  static async getCalendarInfo(
    calendarId: string
  ): Promise<{ name: string; type: 'group' | 'personal' }> {
    const config = await this.getCalendarConfig();

    switch (calendarId) {
      case config.PROJECT:
        return { name: 'AJC Projects Calendar', type: 'group' };
      case config.WORK_ORDER:
        return { name: 'Work Orders Calendar', type: 'group' };
      case config.ADHOC:
      case 'primary':
        return { name: 'Personal Calendar', type: 'personal' };
      default:
        return { name: 'Custom Calendar', type: 'group' };
    }
  }
}
