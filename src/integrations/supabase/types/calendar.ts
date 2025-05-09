import { Database } from '../types';
import { CalendarAccessLevel } from '@/types/calendar';

/**
 * Updates the Database interface to include the new calendar tables.
 * These types should be copied to the generated types when refreshing
 * the database schema types.
 */
declare module '../types' {
  interface Database {
    public: {
      Tables: {
        organization_calendar: {
          Row: {
            id: string;
            google_calendar_id: string | null;
            is_enabled: boolean;
            name: string;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            google_calendar_id?: string | null;
            is_enabled?: boolean;
            name?: string;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            google_calendar_id?: string | null;
            is_enabled?: boolean;
            name?: string;
            created_at?: string;
            updated_at?: string;
          };
        };
        calendar_access: {
          Row: {
            id: string;
            calendar_id: string;
            employee_id: string;
            access_level: CalendarAccessLevel;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            calendar_id: string;
            employee_id: string;
            access_level?: CalendarAccessLevel;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            calendar_id?: string;
            employee_id?: string;
            access_level?: CalendarAccessLevel;
            created_at?: string;
            updated_at?: string;
          };
        };
      };
    };
  }
}

// Export type aliases for the calendar tables
export type OrganizationCalendarRow = Database['public']['Tables']['organization_calendar']['Row'];
export type OrganizationCalendarInsert =
  Database['public']['Tables']['organization_calendar']['Insert'];
export type OrganizationCalendarUpdate =
  Database['public']['Tables']['organization_calendar']['Update'];

export type CalendarAccessRow = Database['public']['Tables']['calendar_access']['Row'];
export type CalendarAccessInsert = Database['public']['Tables']['calendar_access']['Insert'];
export type CalendarAccessUpdate = Database['public']['Tables']['calendar_access']['Update'];
