// Define the ScheduleItem type directly with the fields we need
export interface ScheduleItem {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  start_datetime: string; // ISO string
  end_datetime: string; // ISO string
  is_all_day?: boolean;
  assignee_type?: 'employee' | 'subcontractor' | null;
  assignee_id?: string | null;
  linked_milestone_id?: string | null;
  calendar_integration_enabled?: boolean;
  google_event_id?: string | null;
  send_invite?: boolean;
  invite_status?: string | null;
  last_sync_error?: string | null;
  created_at?: string;
  updated_at?: string;
  is_completed?: boolean;
  recurrence?: RecurrencePattern | null;
  object_type?: ScheduleObjectType | null;
}

// Define a recurrence pattern interface for the JSONB field
export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number; // How many days/weeks/months/years between occurrences
  weekDays?: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[]; // For weekly recurrence
  monthDay?: number; // For monthly recurrence (day of month)
  endDate?: string; // ISO date string when recurrence ends
  count?: number; // Number of occurrences
}

// Define object types that can be used in schedule_items.object_type
export type ScheduleObjectType =
  | 'task'
  | 'meeting'
  | 'appointment'
  | 'milestone'
  | 'deadline'
  | 'event';
