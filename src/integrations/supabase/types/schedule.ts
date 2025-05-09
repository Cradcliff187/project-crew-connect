import { Database } from '../types';

/**
 * Updates the Database interface to include the schedule_items table.
 * These types should be copied to the generated types when refreshing
 * the database schema types.
 */
declare module '../types' {
  interface Database {
    public: {
      Tables: {
        schedule_items: {
          Row: {
            id: string;
            project_id: string;
            title: string;
            description: string | null;
            start_datetime: string;
            end_datetime: string;
            is_all_day: boolean | null;
            assignee_type: 'employee' | 'subcontractor' | null;
            assignee_id: string | null;
            linked_milestone_id: string | null;
            calendar_integration_enabled: boolean | null;
            google_event_id: string | null;
            send_invite: boolean | null;
            invite_status: string | null;
            last_sync_error: string | null;
            created_at: string;
            updated_at: string;
          };
          Insert: {
            id?: string;
            project_id: string;
            title: string;
            description?: string | null;
            start_datetime: string;
            end_datetime: string;
            is_all_day?: boolean | null;
            assignee_type?: 'employee' | 'subcontractor' | null;
            assignee_id?: string | null;
            linked_milestone_id?: string | null;
            calendar_integration_enabled?: boolean | null;
            google_event_id?: string | null;
            send_invite?: boolean | null;
            invite_status?: string | null;
            last_sync_error?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Update: {
            id?: string;
            project_id?: string;
            title?: string;
            description?: string | null;
            start_datetime?: string;
            end_datetime?: string;
            is_all_day?: boolean | null;
            assignee_type?: 'employee' | 'subcontractor' | null;
            assignee_id?: string | null;
            linked_milestone_id?: string | null;
            calendar_integration_enabled?: boolean | null;
            google_event_id?: string | null;
            send_invite?: boolean | null;
            invite_status?: string | null;
            last_sync_error?: string | null;
            created_at?: string;
            updated_at?: string;
          };
          Relationships: [
            {
              foreignKeyName: 'fk_project';
              columns: ['project_id'];
              referencedRelation: 'projects';
              referencedColumns: ['projectid'];
            },
            {
              foreignKeyName: 'fk_milestone';
              columns: ['linked_milestone_id'];
              referencedRelation: 'project_milestones';
              referencedColumns: ['id'];
            },
          ];
        };
      };
    };
  }
}

// Export type aliases for the schedule items
export type ScheduleItemRow = Database['public']['Tables']['schedule_items']['Row'];
export type ScheduleItemInsert = Database['public']['Tables']['schedule_items']['Insert'];
export type ScheduleItemUpdate = Database['public']['Tables']['schedule_items']['Update'];
