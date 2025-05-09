import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { googleCalendarService } from '@/services/googleCalendarService';
import { useToast } from '@/hooks/use-toast';
import { EventAttendee } from '@/types/unifiedCalendar';
import UnifiedCalendarForm, { CalendarFormData } from '@/components/common/UnifiedCalendarForm';
import { ProjectFormValues } from '../schemas/projectFormSchema';
import { useProjectState } from '@/components/projects/hooks/useProjectState';
import AttendeeSelector from '@/components/common/AttendeeSelector';

interface ProjectCalendarFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectData: Partial<ProjectFormValues> | null;
  projectId?: string;
  onSave: (projectData: Partial<ProjectFormValues>) => Promise<boolean>;
  onCancel: () => void;
}

const ProjectCalendarForm = ({
  open,
  onOpenChange,
  projectData,
  projectId = '',
  onSave,
  onCancel,
}: ProjectCalendarFormProps) => {
  const [assignedEmployees, setAssignedEmployees] = useState<EventAttendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifyExternalAttendees, setNotifyExternalAttendees] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const { updateProject } = useProjectState();

  // Use project ID from props or URL params
  const currentProjectId = projectId || params.projectId || '';

  // Fetch existing assignments if this is an existing project
  useEffect(() => {
    if (currentProjectId && open) {
      const fetchAssignments = async () => {
        try {
          setIsLoading(true);

          // Get assignments for this project
          const { data: assignments, error } = await supabase.rpc('get_entity_assignments', {
            p_entity_type: 'project',
            p_entity_id: currentProjectId,
          });

          if (error) throw error;

          if (assignments) {
            // Convert assignments to attendees
            const attendees: EventAttendee[] = assignments.map((assignment: any) => ({
              id: assignment.assignee_id,
              type: assignment.assignee_type || 'employee',
              name: assignment.assignee_name,
              email: assignment.assignee_email,
              rate: assignment.rate_per_hour,
              response_status: assignment.response_status || 'needsAction',
            }));

            setAssignedEmployees(attendees);
          }
        } catch (error) {
          console.error('Error fetching assignments:', error);
          toast({
            title: 'Error',
            description: 'Could not load assigned employees.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchAssignments();
    } else {
      // For new projects, we don't have assigned employees
      setIsLoading(false);
    }
  }, [currentProjectId, open, toast]);

  // Function to map project data to calendar form data
  const mapToCalendarFormData = (): CalendarFormData => {
    // Format location from site location if available
    let location = '';
    if (projectData?.siteLocation) {
      const { address, city, state, zip } = projectData.siteLocation;
      const parts = [address, city, state, zip].filter(Boolean);
      location = parts.join(', ');
    }

    // Create a title that includes the project name
    const title = projectData?.projectName || '';

    // Build description with relevant project details
    const description = projectData?.jobDescription || '';

    // Extended properties for the project
    const extendedProperties: Record<string, string> = {
      projectId: currentProjectId || '',
    };

    if (projectData?.customerId) {
      extendedProperties.customerId = projectData.customerId;
    }

    if (projectData?.estimateId) {
      extendedProperties.estimateId = projectData.estimateId;
    }

    // Handle dates - projects often have start date and due date
    const startDate = projectData?.start_date ? new Date(projectData.start_date) : null;

    const endDate = projectData?.dueDate
      ? new Date(projectData.dueDate)
      : startDate
        ? new Date(startDate)
        : null;

    return {
      title,
      description,
      startDate,
      endDate,
      isAllDay: true, // Projects are typically all-day events
      location,
      attendees: assignedEmployees,
      notifyExternalAttendees, // Use state for notification preference
      syncEnabled: true, // Default to enabled for projects
      entityType: 'project',
      entityId: currentProjectId || 'new',
      extendedProperties,
    };
  };

  // Function to map calendar form data back to project data
  const mapToProjectData = async (formData: CalendarFormData): Promise<boolean> => {
    try {
      // Extract calendar event data
      const projectUpdate: Partial<ProjectFormValues> = {
        ...projectData,
        projectName: formData.title,
        jobDescription: formData.description,
        start_date: formData.startDate ? formData.startDate.toISOString() : null,
        dueDate: formData.endDate ? formData.endDate.toISOString() : null,
      };

      // First, update the project details in the database
      const success = await onSave(projectUpdate);
      if (!success) return false;

      // Don't proceed with calendar sync if it's not enabled
      if (!formData.syncEnabled) return true;

      // Get the correct project calendar ID
      const projectCalendarId = await googleCalendarService.getEntityCalendarId('project');

      // If we can't get a valid calendar ID, show an error but still save the project
      if (!projectCalendarId) {
        toast({
          title: 'Warning',
          description: 'Project saved but calendar sync failed. Could not determine calendar ID.',
          variant: 'warning',
        });
        return true;
      }

      // Create a calendar event for the project
      const eventInput = {
        title: formData.title,
        description: formData.description,
        start_datetime: formData.startDate
          ? formData.startDate.toISOString()
          : new Date().toISOString(),
        end_datetime: formData.endDate ? formData.endDate.toISOString() : null,
        is_all_day: formData.isAllDay,
        location: formData.location,
        calendar_id: projectCalendarId,
        attendees: formData.attendees,
        entity_type: 'project',
        entity_id: currentProjectId || 'new',
        sync_enabled: true,
        extended_properties: formData.extendedProperties,
      };

      // Use the notification preference for external attendees
      const googleOptions = {
        sendUpdates: formData.notifyExternalAttendees ? 'all' : 'none',
      };

      // Create or update the calendar event
      const result = await googleCalendarService.createEvent(eventInput, googleOptions);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Project scheduled on calendar successfully.',
        });
      } else {
        toast({
          title: 'Warning',
          description: 'Project saved but calendar sync failed. Please try syncing again later.',
          variant: 'warning',
        });
      }

      // Navigate to the project detail page if this is a new project
      if (currentProjectId === 'new' && result.event?.entity_id) {
        navigate(`/projects/${result.event.entity_id}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving project calendar event:', error);
      toast({
        title: 'Error',
        description: 'Could not save calendar event. Project details were saved.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Handle notification toggle
  const handleNotificationToggle = (notify: boolean) => {
    setNotifyExternalAttendees(notify);
  };

  // Render nothing while loading to avoid flicker
  if (isLoading) {
    return null;
  }

  return (
    <UnifiedCalendarForm
      open={open}
      onOpenChange={onOpenChange}
      initialData={mapToCalendarFormData()}
      onSave={mapToProjectData}
      onCancel={onCancel}
      title={currentProjectId ? 'Edit Project Schedule' : 'Schedule Project'}
      description="Set the schedule and calendar details for this project."
      entityType="project"
      entityId={currentProjectId || 'new'}
      showAttendees={true}
      notifyExternalAttendees={notifyExternalAttendees}
      onNotifyExternalAttendeesChange={handleNotificationToggle}
      attendeeSelector={
        <AttendeeSelector
          entityType="project"
          entityId={currentProjectId || 'new'}
          attendees={assignedEmployees}
          onChange={setAssignedEmployees}
        />
      }
    />
  );
};

export default ProjectCalendarForm;
