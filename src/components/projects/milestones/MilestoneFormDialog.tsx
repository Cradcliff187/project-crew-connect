import { useState } from 'react';
import { ICalendarEventBase } from '@/types/unifiedCalendar';
import { CalendarEventForm } from '@/components/common/CalendarEventForm';
import {
  ProjectMilestone,
  MilestoneStatus,
  MilestonePriority,
  AssigneeType,
} from './hooks/useMilestones';

interface MilestoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMilestone: ProjectMilestone | null;
  onSave: (
    title: string,
    description: string,
    dueDate: Date | undefined,
    calendarSync: boolean,
    additionalFields?: Partial<ProjectMilestone>
  ) => Promise<boolean>;
  onCancel: () => void;
}

const MilestoneFormDialog = ({
  open,
  onOpenChange,
  editingMilestone,
  onSave,
  onCancel,
}: MilestoneFormDialogProps) => {
  // Convert legacy ProjectMilestone to unified ICalendarEventBase
  const mapToCalendarEvent = (
    milestone: ProjectMilestone | null
  ): Partial<ICalendarEventBase> | undefined => {
    if (!milestone) return undefined;

    // Create extended calendar event data with custom fields
    const calendarData: Partial<ICalendarEventBase> & {
      priority?: MilestonePriority;
      status?: MilestoneStatus;
    } = {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description || null,
      // Use due_date as end_datetime and start_date as start_datetime
      start_datetime: milestone.start_date || milestone.due_date || '',
      end_datetime: milestone.due_date || '',
      is_all_day: true, // Milestones are typically all-day events
      assignee_type: milestone.assignee_type || null,
      assignee_id: milestone.assignee_id || null,
      entity_type: 'project_milestone',
      entity_id: milestone.id,
      sync_enabled: milestone.calendar_sync_enabled || false,
      // Add milestone specific data to be saved later
      priority: milestone.priority,
      status: milestone.status,
    };

    return calendarData;
  };

  // Convert unified ICalendarEventBase back to legacy ProjectMilestone format
  const mapToMilestone = async (
    eventData: Partial<ICalendarEventBase> & {
      priority?: MilestonePriority;
      status?: MilestoneStatus;
    }
  ): Promise<boolean> => {
    // Extract the milestone-specific fields
    const dueDate = eventData.end_datetime ? new Date(eventData.end_datetime) : undefined;
    const startDate = eventData.start_datetime ? new Date(eventData.start_datetime) : undefined;

    // Prepare additional fields
    const additionalFields: Partial<ProjectMilestone> = {
      start_date: startDate ? startDate.toISOString() : undefined,
      status: eventData.status || 'not_started',
      priority: eventData.priority || 'medium',
      assignee_type: eventData.assignee_type as AssigneeType | undefined,
      assignee_id: eventData.assignee_id,
    };

    return await onSave(
      eventData.title || '',
      eventData.description || '',
      dueDate,
      eventData.sync_enabled || false,
      additionalFields
    );
  };

  // Extract calendar event data from the editing milestone
  const calendarEventData = mapToCalendarEvent(editingMilestone);
  const projectId = editingMilestone?.projectid;

  return (
    <CalendarEventForm
      open={open}
      onOpenChange={onOpenChange}
      eventData={calendarEventData}
      entityType="project_milestone"
      entityId={editingMilestone?.id || ''}
      projectId={projectId}
      onSave={mapToMilestone}
      onCancel={onCancel}
      title={editingMilestone ? 'Edit Task' : 'Add New Task'}
      description={
        editingMilestone
          ? 'Update the details for this task.'
          : 'Fill in the details to create a new task for this project.'
      }
    />
  );
};

export default MilestoneFormDialog;
