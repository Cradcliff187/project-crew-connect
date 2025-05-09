/**
 * Types for the calendar system
 */

/**
 * Access level for calendar access control
 */
export type CalendarAccessLevel = 'read' | 'write' | 'admin';

/**
 * Organization calendar structure
 */
export interface OrganizationCalendar {
  id: string;
  google_calendar_id: string | null;
  is_enabled: boolean;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Calendar access control entry
 */
export interface CalendarAccess {
  id: string;
  calendar_id: string;
  employee_id: string;
  access_level: CalendarAccessLevel;
  created_at: string;
  updated_at: string;
}

/**
 * Status options for tasks and milestones
 */
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

/**
 * Priority levels for tasks and milestones
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Types of entities that can be assigned to tasks
 */
export type AssigneeType = 'employee' | 'vendor' | 'subcontractor';

export interface ProjectCalendar {
  id: string;
  project_id: string;
  google_calendar_id: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectCalendarAccess {
  id: string;
  project_calendar_id: string;
  employee_id: string;
  access_level: CalendarAccessLevel;
  created_at: string;
  updated_at: string;
}

export interface ProjectCalendarSettings {
  id?: string;
  project_id: string;
  google_calendar_id?: string | null;
  is_enabled?: boolean;
}

export interface CalendarAccessEntry {
  id?: string;
  project_calendar_id: string;
  employee_id: string;
  access_level: CalendarAccessLevel;
}

export interface CalendarEventOptions {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  entityType: 'project_milestone' | 'work_order' | 'contact_interaction' | 'time_entry';
  entityId: string;
  attendees?: string[];
  projectCalendarId?: string;
  useProjectCalendar?: boolean;
  notifyAttendees?: boolean;
}

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  error?: any;
  reason?:
    | 'not_authenticated'
    | 'authentication_required'
    | 'api_error'
    | 'user_cancelled'
    | 'rate_limit'
    | 'network_error'
    | 'invalid_parameters';
  retryable?: boolean;
}
