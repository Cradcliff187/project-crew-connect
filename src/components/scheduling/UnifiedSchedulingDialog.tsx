import { useState, useEffect } from 'react';
import {
  Check,
  X,
  Calendar,
  UserCircle,
  Mail,
  Building2,
  AlertCircle,
  Wrench,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { AssigneeSelector } from '@/components/common/AssigneeSelector';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  EnhancedCalendarService,
  EnhancedCalendarEventData,
} from '@/services/enhancedCalendarService';
import {
  CalendarSelectionService,
  CalendarSelectionContext,
} from '@/services/calendarSelectionService';

export interface UnifiedSchedulingContext {
  // Context information
  entityType?:
    | 'project_milestone'
    | 'schedule_item'
    | 'work_order'
    | 'contact_interaction'
    | 'time_entry'
    | 'personal_task';
  projectId?: string;
  projectName?: string;
  workOrderId?: string;
  workOrderNumber?: string;

  // Pre-filled data
  title?: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: string;

  // Assignee context
  assignees?: {
    type: 'employee' | 'subcontractor';
    id: string;
    email?: string;
  }[];
}

interface UnifiedSchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: UnifiedSchedulingContext;
  onSave: (eventData: EnhancedCalendarEventData) => Promise<boolean>;
  onCancel: () => void;
}

interface Project {
  id: string;
  name: string;
  status?: string;
}

interface WorkOrder {
  id: string;
  title: string;
  status?: string;
}

const UnifiedSchedulingDialog = ({
  open,
  onOpenChange,
  context = {},
  onSave,
  onCancel,
}: UnifiedSchedulingDialogProps) => {
  // Form state - aligned with Google Calendar fields
  const [summary, setSummary] = useState(context.title || ''); // Google Calendar uses 'summary' not 'title'
  const [description, setDescription] = useState(context.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(context.startDateTime);
  const [endDate, setEndDate] = useState<Date | undefined>(context.endDateTime);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState(context.location || '');

  // Entity selection state
  const [entityType, setEntityType] = useState<CalendarSelectionContext['entityType']>(
    context.entityType || 'personal_task'
  );
  const [selectedProjectId, setSelectedProjectId] = useState(context.projectId || '');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(context.workOrderId || '');

  // Data loading state
  const [projects, setProjects] = useState<Project[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);

  // Assignee and calendar state
  const [assignees, setAssignees] = useState<UnifiedSchedulingContext['assignees']>(
    context.assignees || []
  );

  // Calendar preview
  const [calendarPreview, setCalendarPreview] = useState<{
    primary: string;
    additional: string[];
    invites: string[];
  } | null>(null);

  const { toast } = useToast();

  // Load projects when needed
  useEffect(() => {
    if (
      open &&
      (entityType === 'schedule_item' ||
        entityType === 'project_milestone' ||
        entityType === 'contact_interaction')
    ) {
      setLoadingProjects(true);
      fetch('/api/projects', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setProjects(
            data.map((p: any) => ({
              id: p.projectid,
              name: p.projectname || p.projectid,
              status: p.status,
            }))
          );
        })
        .catch(error => {
          console.error('Error loading projects:', error);
          toast({
            title: 'Error loading projects',
            description: 'Failed to load project list',
            variant: 'destructive',
          });
        })
        .finally(() => setLoadingProjects(false));
    }
  }, [open, entityType, toast]);

  // Load work orders when needed
  useEffect(() => {
    if (open && entityType === 'work_order') {
      setLoadingWorkOrders(true);
      fetch('/api/work-orders', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setWorkOrders(
            data.map((wo: any) => ({
              id: wo.work_order_id,
              title: wo.title || `Work Order ${wo.work_order_id.substring(0, 8)}`,
              status: wo.status,
            }))
          );
        })
        .catch(error => {
          console.error('Error loading work orders:', error);
          toast({
            title: 'Error loading work orders',
            description: 'Failed to load work order list',
            variant: 'destructive',
          });
        })
        .finally(() => setLoadingWorkOrders(false));
    }
  }, [open, entityType, toast]);

  // Update calendar preview when relevant fields change
  useEffect(() => {
    const previewContext: CalendarSelectionContext = {
      entityType,
      projectId: selectedProjectId || context.projectId,
      workOrderId: selectedWorkOrderId || context.workOrderId,
      assignees,
      userEmail: 'current-user@example.com', // This would come from auth context
    };

    CalendarSelectionService.selectCalendars(previewContext)
      .then(selection => {
        setCalendarPreview(EnhancedCalendarService.getCalendarDisplayInfo(selection));
      })
      .catch(error => {
        console.error('Error generating calendar preview:', error);
        setCalendarPreview(null);
      });
  }, [
    entityType,
    selectedProjectId,
    selectedWorkOrderId,
    assignees,
    context.projectId,
    context.workOrderId,
  ]);

  // Auto-set end time based on start time (1 hour duration)
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
  }, [startTime]);

  // Auto-set end date to start date if not set
  useEffect(() => {
    if (startDate && !endDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const handleSave = async () => {
    // Validation
    if (!summary.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the scheduled event.',
        variant: 'destructive',
      });
      return;
    }

    if (!startDate) {
      toast({
        title: 'Start date required',
        description: 'Please select a start date.',
        variant: 'destructive',
      });
      return;
    }

    if (!endDate) {
      toast({
        title: 'End date required',
        description: 'Please select an end date.',
        variant: 'destructive',
      });
      return;
    }

    // Create datetime objects
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      toast({
        title: 'Invalid time range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    // Prepare event data - using Google Calendar field names
    const eventData: EnhancedCalendarEventData = {
      title: summary.trim(), // Maps to Google Calendar 'summary'
      description: description || undefined,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: location || undefined,
      entityType,
      entityId: `temp-${Date.now()}`, // This would be set by the calling component
      projectId: selectedProjectId || context.projectId,
      workOrderId: selectedWorkOrderId || context.workOrderId,
      assignees,
      userEmail: 'current-user@example.com', // From auth context
      sendNotifications: true, // Always send notifications for better UX
    };

    const success = await onSave(eventData);
    if (success) {
      onOpenChange(false);
    }
  };

  const getEntityTypeDisplayName = (type: CalendarSelectionContext['entityType']): string => {
    switch (type) {
      case 'project_milestone':
        return 'Project Milestone';
      case 'schedule_item':
        return 'Project Schedule Item';
      case 'work_order':
        return 'Work Order';
      case 'contact_interaction':
        return 'Client Meeting';
      case 'time_entry':
        return 'Time Entry';
      case 'personal_task':
        return 'Personal Task';
      default:
        return 'Event';
    }
  };

  const getContextualTitle = (): string => {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const selectedWorkOrder = workOrders.find(wo => wo.id === selectedWorkOrderId);

    if (selectedProject && selectedWorkOrder) {
      return `Schedule Event - ${selectedProject.name} / ${selectedWorkOrder.title}`;
    } else if (selectedProject || context.projectName) {
      return `Schedule Event - ${selectedProject?.name || context.projectName}`;
    } else if (selectedWorkOrder || context.workOrderNumber) {
      return `Schedule Event - ${selectedWorkOrder?.title || `Work Order ${context.workOrderNumber}`}`;
    }
    return 'Schedule Event';
  };

  const shouldShowProjectDropdown = () => {
    return (
      entityType === 'schedule_item' ||
      entityType === 'project_milestone' ||
      (entityType === 'contact_interaction' && !context.projectId)
    );
  };

  const shouldShowWorkOrderDropdown = () => {
    return entityType === 'work_order' && !context.workOrderId;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {getContextualTitle()}
          </DialogTitle>
          <DialogDescription>
            Create a scheduled event with intelligent calendar integration and automatic invites.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Context Information */}
          {(context.projectName ||
            context.workOrderNumber ||
            selectedProjectId ||
            selectedWorkOrderId) && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <div className="flex flex-wrap gap-2">
                  {(context.projectName || projects.find(p => p.id === selectedProjectId)) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Project:{' '}
                      {context.projectName || projects.find(p => p.id === selectedProjectId)?.name}
                    </Badge>
                  )}
                  {(context.workOrderNumber ||
                    workOrders.find(wo => wo.id === selectedWorkOrderId)) && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      Work Order:{' '}
                      {context.workOrderNumber ||
                        workOrders.find(wo => wo.id === selectedWorkOrderId)?.title}
                    </Badge>
                  )}
                  {calendarPreview && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {calendarPreview.primary}
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Event Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Event Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Type */}
              <div>
                <Label htmlFor="entityType" className="text-sm font-medium">
                  Event Type *
                </Label>
                <Select value={entityType} onValueChange={(value: any) => setEntityType(value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="schedule_item">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        Project Schedule Item
                      </div>
                    </SelectItem>
                    <SelectItem value="work_order">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-orange-500" />
                        Work Order
                      </div>
                    </SelectItem>
                    <SelectItem value="contact_interaction">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        Client Meeting
                      </div>
                    </SelectItem>
                    <SelectItem value="personal_task">
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-purple-500" />
                        Personal Task
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Project Dropdown */}
              {shouldShowProjectDropdown() && (
                <div>
                  <Label htmlFor="project" className="text-sm font-medium">
                    Project{' '}
                    {entityType === 'schedule_item' || entityType === 'project_milestone'
                      ? '*'
                      : ''}
                  </Label>
                  <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                    disabled={loadingProjects}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={loadingProjects ? 'Loading projects...' : 'Select a project'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {entityType === 'contact_interaction' && (
                        <SelectItem value="">
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-gray-400" />
                            General Meeting (No Project)
                          </div>
                        </SelectItem>
                      )}
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{project.name}</span>
                            {project.status && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {project.status}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Work Order Dropdown */}
              {shouldShowWorkOrderDropdown() && (
                <div>
                  <Label htmlFor="workOrder" className="text-sm font-medium">
                    Work Order *
                  </Label>
                  <Select
                    value={selectedWorkOrderId}
                    onValueChange={setSelectedWorkOrderId}
                    disabled={loadingWorkOrders}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue
                        placeholder={
                          loadingWorkOrders ? 'Loading work orders...' : 'Select a work order'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {workOrders.map(workOrder => (
                        <SelectItem key={workOrder.id} value={workOrder.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{workOrder.title}</span>
                            {workOrder.status && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {workOrder.status}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="summary" className="text-sm font-medium">
                Event Title *
              </Label>
              <Input
                id="summary"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Enter a descriptive title for this event"
                className="mt-1"
              />
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter location (address, room, or virtual meeting link)"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Add details, agenda, or notes about this event"
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Date and Time Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Date & Time</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Date & Time *</Label>
                <div className="flex gap-2 mt-1">
                  <DatePicker date={startDate} setDate={setStartDate} />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-[120px]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">End Date & Time *</Label>
                <div className="flex gap-2 mt-1">
                  <DatePicker date={endDate} setDate={setEndDate} />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Attendees Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-blue-600" />
              <h3 className="font-medium">Attendees</h3>
            </div>

            <div>
              <Label className="text-sm font-medium">Assign To (Optional)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Selected attendees will automatically receive calendar invites
              </p>
              <AssigneeSelector
                value={assignees?.map(a => ({ type: a.type as any, id: a.id })) || null}
                onChange={async selected => {
                  if (!selected) {
                    setAssignees([]);
                    return;
                  }

                  // Fetch emails from backend
                  const assigneesWithEmails = await Promise.all(
                    selected.map(async s => {
                      try {
                        const response = await fetch(`/api/assignees/${s.type}/${s.id}/email`, {
                          credentials: 'include',
                        });

                        if (response.ok) {
                          const data = await response.json();
                          return {
                            type: s.type as 'employee' | 'subcontractor',
                            id: s.id,
                            email: data.email,
                          };
                        } else {
                          console.warn(`Failed to fetch email for ${s.type} ${s.id}`);
                          return {
                            type: s.type as 'employee' | 'subcontractor',
                            id: s.id,
                            email: undefined,
                          };
                        }
                      } catch (error) {
                        console.error(`Error fetching email for ${s.type} ${s.id}:`, error);
                        return {
                          type: s.type as 'employee' | 'subcontractor',
                          id: s.id,
                          email: undefined,
                        };
                      }
                    })
                  );

                  setAssignees(assigneesWithEmails);
                }}
                allowedTypes={['employee', 'subcontractor']}
                multiple={true}
                maxHeight={200}
              />
            </div>
          </div>

          {/* Calendar Preview */}
          {calendarPreview && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Calendar Integration Preview:</div>
                  <div className="text-sm">
                    <strong>Calendar:</strong> {calendarPreview.primary}
                  </div>
                  {calendarPreview.invites.length > 0 && (
                    <div className="text-sm">
                      <strong>Invites:</strong> {calendarPreview.invites.length} attendee(s) will
                      receive calendar invitations
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Check className="h-4 w-4 mr-1" />
            Schedule Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedSchedulingDialog;
