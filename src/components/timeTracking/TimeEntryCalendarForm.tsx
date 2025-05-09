import { useState } from 'react';
import { ICalendarEventBase, CalendarEntityType } from '@/types/unifiedCalendar';
import { CalendarEventForm } from '@/components/common/CalendarEventForm';
import { TimeEntry, TimeEntryFormValues } from '@/types/timeTracking';
import { format, parse } from 'date-fns';

interface TimeEntryCalendarFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntryData: Partial<TimeEntry> | null;
  timeEntryId?: string;
  projectId?: string;
  onSave: (timeEntryData: Partial<TimeEntry>) => Promise<boolean>;
  onCancel: () => void;
}

// Extended calendar event interface with time entry specific fields
interface TimeEntryCalendarEvent extends Partial<Omit<ICalendarEventBase, 'entity_type'>> {
  entity_type: CalendarEntityType | 'work_order' | 'project';
  source_entity_type?: 'work_order' | 'project';
  source_entity_id?: string;
  hours_worked?: number;
}

const TimeEntryCalendarForm = ({
  open,
  onOpenChange,
  timeEntryData,
  timeEntryId = '',
  projectId,
  onSave,
  onCancel,
}: TimeEntryCalendarFormProps) => {
  // Convert TimeEntry to unified ICalendarEventBase
  const mapToCalendarEvent = (
    data: Partial<TimeEntry> | null
  ): TimeEntryCalendarEvent | undefined => {
    if (!data) return undefined;

    // Create start and end datetimes by combining date_worked with start_time and end_time
    let startDatetime: string | undefined;
    let endDatetime: string | undefined;

    if (data.date_worked) {
      const baseDate = data.date_worked;

      if (data.start_time) {
        const [startHours, startMinutes] = data.start_time.split(':').map(Number);
        const startDate = new Date(baseDate);
        startDate.setHours(startHours, startMinutes, 0, 0);
        startDatetime = startDate.toISOString();
      }

      if (data.end_time) {
        const [endHours, endMinutes] = data.end_time.split(':').map(Number);
        const endDate = new Date(baseDate);
        endDate.setHours(endHours, endMinutes, 0, 0);
        endDatetime = endDate.toISOString();
      }
    }

    return {
      id: timeEntryId,
      title: `Time Entry: ${data.hours_worked || 0} hours`,
      description: data.notes || '',
      start_datetime: startDatetime,
      end_datetime: endDatetime,
      is_all_day: false, // Time entries are not all-day events
      assignee_type: 'employee',
      assignee_id: data.employee_id || null,
      entity_type: 'time_entry', // This is the unified calendar entity type
      entity_id: timeEntryId,
      sync_enabled: data.calendar_sync_enabled || false,
      google_event_id: data.calendar_event_id || null,
      // Time entry specific fields
      source_entity_type: data.entity_type,
      source_entity_id: data.entity_id,
      hours_worked: data.hours_worked,
    };
  };

  // Convert unified ICalendarEventBase back to TimeEntry format
  const mapToTimeEntry = async (
    eventData: Partial<ICalendarEventBase> & {
      source_entity_type?: 'work_order' | 'project';
      source_entity_id?: string;
      hours_worked?: number;
    }
  ): Promise<boolean> => {
    // Extract date and time components from start_datetime and end_datetime
    let dateWorked: string | undefined;
    let startTime: string | undefined;
    let endTime: string | undefined;

    if (eventData.start_datetime) {
      const startDate = new Date(eventData.start_datetime);
      dateWorked = format(startDate, 'yyyy-MM-dd');
      startTime = format(startDate, 'HH:mm');
    }

    if (eventData.end_datetime) {
      const endDate = new Date(eventData.end_datetime);
      endTime = format(endDate, 'HH:mm');
    }

    const timeEntryUpdate: Partial<TimeEntry> = {
      ...timeEntryData,
      date_worked: dateWorked || timeEntryData?.date_worked,
      start_time: startTime || timeEntryData?.start_time,
      end_time: endTime || timeEntryData?.end_time,
      hours_worked: eventData.hours_worked || timeEntryData?.hours_worked || 0,
      notes: eventData.description || timeEntryData?.notes,
      employee_id: eventData.assignee_id || timeEntryData?.employee_id,
      calendar_sync_enabled: eventData.sync_enabled,
      calendar_event_id: eventData.google_event_id,
      // Preserve entity fields
      entity_type: eventData.source_entity_type || timeEntryData?.entity_type,
      entity_id: eventData.source_entity_id || timeEntryData?.entity_id,
    };

    return await onSave(timeEntryUpdate);
  };

  // Extract calendar event data from the time entry data
  const calendarEventData = mapToCalendarEvent(timeEntryData);

  return (
    <CalendarEventForm
      open={open}
      onOpenChange={onOpenChange}
      eventData={calendarEventData as Partial<ICalendarEventBase>}
      entityType="time_entry"
      entityId={timeEntryId}
      projectId={projectId}
      onSave={mapToTimeEntry}
      onCancel={onCancel}
      title="Time Entry Calendar Details"
      description="Set up calendar details for this time entry"
    />
  );
};

export default TimeEntryCalendarForm;
