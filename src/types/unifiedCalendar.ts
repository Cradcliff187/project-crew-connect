/**
 * Unified Calendar Event Types
 *
 * This file contains standardized interfaces for all calendar-related events.
 * These interfaces serve as the single source of truth for calendar event shapes
 * across the application.
 */

// Valid entity types for calendar events
export type CalendarEntityType =
  | 'project_milestone'
  | 'schedule_item'
  | 'work_order'
  | 'contact_interaction'
  | 'time_entry';

// Valid assignee types for calendar events
export type CalendarAssigneeType = 'employee' | 'subcontractor' | 'vendor' | null;

// Base interface for all calendar events
export interface ICalendarEventBase {
  // Core identification
  id: string; // Unique identifier in our system
  google_event_id: string | null; // Google Calendar's event ID (null if not synced)

  // Calendar integration
  calendar_id: string; // Google Calendar ID where the event exists
  sync_enabled: boolean; // Whether this event should sync with Google Calendar
  last_synced_at: string | null; // ISO timestamp of last sync

  // Core event data
  title: string; // Event title/summary
  description: string | null; // Event description
  start_datetime: string; // ISO timestamp for start
  end_datetime: string; // ISO timestamp for end
  is_all_day: boolean; // Whether this is an all-day event
  location: string | null; // Optional location text

  // Assignee/attendee
  assignee_type: CalendarAssigneeType;
  assignee_id: string | null; // ID of the assigned person

  // Entity relation (what this event represents)
  entity_type: CalendarEntityType; // Type of entity this event is linked to
  entity_id: string; // ID in the source entity table

  // Metadata
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  created_by: string | null; // User ID who created the event
}

// Input for creating a new calendar event
export type CreateCalendarEventInput = Omit<
  ICalendarEventBase,
  'id' | 'google_event_id' | 'last_synced_at' | 'created_at' | 'updated_at'
>;

// Input for updating an existing calendar event
export type UpdateCalendarEventInput = Partial<
  Omit<ICalendarEventBase, 'id' | 'created_at' | 'updated_at'>
>;

// Extended interfaces for specific entity types
export interface IProjectMilestoneEvent extends ICalendarEventBase {
  entity_type: 'project_milestone';
  project_id: string; // Associated project
  // Milestone-specific fields
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'not_started' | 'in_progress' | 'blocked' | 'completed';
}

export interface IScheduleItemEvent extends ICalendarEventBase {
  entity_type: 'schedule_item';
  project_id: string; // Associated project
}

export interface IWorkOrderEvent extends ICalendarEventBase {
  entity_type: 'work_order';
  project_id: string; // Associated project
  work_order_number?: string; // Work order reference number
  status?: string; // Current status
}

export interface IContactInteractionEvent extends ICalendarEventBase {
  entity_type: 'contact_interaction';
  contact_id: string; // Associated contact
  interaction_type?: string; // Type of interaction (meeting, call, etc.)
}

export interface ITimeEntryEvent extends ICalendarEventBase {
  entity_type: 'time_entry';
  project_id: string; // Associated project
  task_id?: string; // Associated task if applicable
}

// Response structure for calendar event operations
export interface CalendarEventResponse {
  success: boolean;
  event?: ICalendarEventBase;
  google_event_id?: string;
  error?: string;
}

// Google Calendar specific options that may be passed
export interface GoogleCalendarOptions {
  sendUpdates?: 'all' | 'externalOnly' | 'none';
  sendNotifications?: boolean;
  useDefaultReminders?: boolean;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}
