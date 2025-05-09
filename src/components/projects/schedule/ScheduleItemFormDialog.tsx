import { useState, useEffect } from 'react';
import { ICalendarEventBase } from '@/types/unifiedCalendar';
import { CalendarEventForm } from '@/components/common/CalendarEventForm';

// Define ScheduleItem interface based on the new table
export interface ScheduleItem {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  start_datetime: string; // ISO string
  end_datetime: string; // ISO string
  is_all_day?: boolean;
  assignee_type?: 'employee' | 'subcontractor' | null;
  assignee_id?: string | null; // TEXT type to handle UUID or subid
  linked_milestone_id?: string | null;
  calendar_integration_enabled?: boolean;
  google_event_id?: string | null;
  send_invite?: boolean;
  invite_status?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ScheduleItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: ScheduleItem | null; // Changed from editingMilestone
  projectId: string; // Need project ID to associate the item
  onSave: (itemData: Partial<ScheduleItem>) => Promise<boolean>; // Pass the whole object
  onCancel: () => void;
}

const ScheduleItemFormDialog = ({
  open,
  onOpenChange,
  editingItem,
  projectId,
  onSave,
  onCancel,
}: ScheduleItemFormDialogProps) => {
  // Convert legacy ScheduleItem to unified ICalendarEventBase
  const mapToCalendarEvent = (
    item: ScheduleItem | null
  ): Partial<ICalendarEventBase> | undefined => {
    if (!item) return undefined;

    return {
      id: item.id,
      title: item.title,
      description: item.description || null,
      start_datetime: item.start_datetime,
      end_datetime: item.end_datetime,
      is_all_day: item.is_all_day || false,
      assignee_type: item.assignee_type || null,
      assignee_id: item.assignee_id || null,
      entity_type: 'schedule_item',
      entity_id: item.id,
      sync_enabled: item.calendar_integration_enabled || false,
      google_event_id: item.google_event_id || null,
    };
  };

  // Convert unified ICalendarEventBase back to legacy ScheduleItem
  const mapToScheduleItem = async (eventData: Partial<ICalendarEventBase>): Promise<boolean> => {
    const scheduleItemData: Partial<ScheduleItem> = {
      ...(eventData.id ? { id: eventData.id } : {}),
      project_id: projectId,
      title: eventData.title || '',
      description: eventData.description,
      start_datetime: eventData.start_datetime || '',
      end_datetime: eventData.end_datetime || '',
      is_all_day: eventData.is_all_day,
      assignee_type: eventData.assignee_type as 'employee' | 'subcontractor' | null,
      assignee_id: eventData.assignee_id,
      calendar_integration_enabled: eventData.sync_enabled,
      send_invite: eventData.sync_enabled,
    };

    return await onSave(scheduleItemData);
  };

  // Extract calendar event data from the editing item
  const calendarEventData = mapToCalendarEvent(editingItem);

  return (
    <CalendarEventForm
      open={open}
      onOpenChange={onOpenChange}
      eventData={calendarEventData}
      entityType="schedule_item"
      entityId={editingItem?.id || ''}
      projectId={projectId}
      onSave={mapToScheduleItem}
      onCancel={onCancel}
      title={editingItem ? 'Edit Schedule Item' : 'Add Schedule Item'}
      description={
        editingItem
          ? 'Update the details for this scheduled item.'
          : 'Schedule a specific task or event for this project.'
      }
    />
  );
};

export default ScheduleItemFormDialog;
