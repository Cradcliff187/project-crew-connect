/**
 * Unified Calendar Types
 *
 * This file contains TypeScript interfaces for the unified calendar event model.
 * These types are used throughout the application to standardize calendar operations.
 */

/**
 * Entity types that can be synchronized with calendars
 */
export type EntityType =
  | 'work_order'
  | 'project'
  | 'ad_hoc'
  | 'schedule_item'
  | 'time_entry'
  | 'project_milestone'
  | 'contact_interaction';

/**
 * Types of assignees that can be added to calendar events
 */
export type AssigneeType = 'employee' | 'subcontractor' | 'customer' | 'vendor' | 'contact';

/**
 * Base interface for calendar events
 */
export interface ICalendarEventBase {
  id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  is_all_day: boolean;
  location: string | null;

  // Entity and assignee information
  assignee_type: AssigneeType | null;
  assignee_id: string | null;
  entity_type: EntityType;
  entity_id: string;

  // Calendar integration fields
  sync_enabled: boolean;
  calendar_id: string;
  google_event_id: string | null;
  last_synced_at: string | null;
  etag?: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string | null;

  // Attendees for the event
  attendees?: EventAttendee[];

  // Extended properties
  extended_properties?: Record<string, string>;

  // Calendar-specific flags
  notify_external_attendees?: boolean;
}

/**
 * Interface for creating a new calendar event
 */
export interface CreateCalendarEventInput {
  title: string;
  description?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  is_all_day?: boolean;
  location?: string | null;

  // Entity and assignee information
  assignee_type?: AssigneeType | null;
  assignee_id?: string | null;
  entity_type: EntityType;
  entity_id: string;

  // Calendar integration fields
  sync_enabled?: boolean;
  calendar_id?: string;

  // Attendees to invite
  attendees?: EventAttendee[];

  // Notification preferences
  notify_external_attendees?: boolean;

  // Extended properties
  extended_properties?: Record<string, string>;
}

/**
 * Interface for updating an existing calendar event
 */
export interface UpdateCalendarEventInput {
  title?: string;
  description?: string | null;
  start_datetime?: string;
  end_datetime?: string | null;
  is_all_day?: boolean;
  location?: string | null;

  // Entity and assignee information
  assignee_type?: AssigneeType | null;
  assignee_id?: string | null;

  // Calendar integration fields
  sync_enabled?: boolean;
  calendar_id?: string;

  // Attendees to invite or update
  attendees?: EventAttendee[];

  // Notification preferences
  notify_external_attendees?: boolean;

  // Extended properties
  extended_properties?: Record<string, string>;
}

/**
 * Response from calendar operations
 */
export interface CalendarEventResponse {
  success: boolean;
  event?: ICalendarEventBase;
  google_event_id?: string;
  etag?: string;
  error?: string;
  multiDayExpanded?: boolean;
  totalDays?: number;
}

/**
 * Google Calendar specific options
 */
export interface GoogleCalendarOptions {
  sendUpdates?: 'all' | 'externalOnly' | 'none';
  conferenceDataVersion?: number;
  maxAttendees?: number;
  supportAttachments?: boolean;
  colorId?: string;
}

/**
 * Attendee information for calendar events
 */
export interface EventAttendee {
  id: string;
  type: AssigneeType;
  email?: string;
  name?: string;
  rate?: number;
  response_status?: 'needsAction' | 'accepted' | 'declined' | 'tentative';
  comment?: string;
  is_organizer?: boolean;
  is_optional?: boolean;
  is_resource?: boolean;
}

/**
 * Assignment information for tracking calendar assignments
 */
export interface CalendarAssignment {
  id?: string;
  entity_type: EntityType;
  entity_id: string;
  assignee_id: string;
  calendar_id: string;
  google_event_id: string;
  etag: string;
  start_date: string;
  end_date: string | null;
  rate_per_hour: number | null;
  last_synced_at?: string;
}

/**
 * Calendar settings for different entity types
 */
export interface CalendarSettings {
  entity_type: EntityType;
  calendar_id: string;
  is_enabled: boolean;
  default_timezone: string;
  notify_external_attendees: boolean;
}

/**
 * Calendar sync cursor for incremental synchronization
 */
export interface SyncCursor {
  calendar_id: string;
  next_sync_token: string | null;
  last_sync_time: string | null;
}

/**
 * Push notification channel for real-time updates
 */
export interface PushNotificationChannel {
  id: string;
  calendar_id: string;
  resource_id: string;
  expiration: string;
  created_at: string;
}

/**
 * Cost calculation result from calendar assignments
 */
export interface AssignmentCost {
  entity_type: EntityType;
  entity_id: string;
  total_cost: number;
  total_hours: number;
  assignee_details: {
    assignee_id: string;
    assignee_name: string;
    assignee_email: string;
    rate_per_hour: number;
    work_days: number;
    total_hours: number;
    cost: number;
  }[];
}

/**
 * Calendar event with daily expansion for multi-day events
 */
export interface CalendarDailyEvent extends ICalendarEventBase {
  day_number: number;
  total_days: number;
  original_event_id?: string;
}

/**
 * Calendar service authentication strategy
 */
export type CalendarAuthStrategy = 'oauth' | 'service_account';

/**
 * Two-way sync result
 */
export interface TwoWaySyncResult {
  success: boolean;
  changes: {
    created: number;
    updated: number;
    deleted: number;
  };
  next_sync_token?: string;
}
