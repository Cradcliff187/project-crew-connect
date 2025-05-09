import { useState, useEffect, useMemo } from 'react';
import { Check, X, Calendar, UserCircle, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  ICalendarEventBase,
  CreateCalendarEventInput,
  EntityType,
  AssigneeType,
} from '@/types/unifiedCalendar';
import { googleCalendarService } from '@/services/googleCalendarService';

interface CalendarEventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventData?: Partial<ICalendarEventBase>; // For editing existing events
  entityType: EntityType;
  entityId: string;
  projectId?: string; // Optional for entities that belong to projects
  onSave: (eventData: Partial<ICalendarEventBase>) => Promise<boolean>;
  onCancel: () => void;
  title: string;
  description?: string;
}

export function CalendarEventForm({
  open,
  onOpenChange,
  eventData,
  entityType,
  entityId,
  projectId,
  onSave,
  onCancel,
  title: dialogTitle,
  description: dialogDescription,
}: CalendarEventFormProps) {
  // Form state
  const [title, setTitle] = useState(eventData?.title || '');
  const [description, setDescription] = useState(eventData?.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    eventData?.start_datetime ? new Date(eventData.start_datetime) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    eventData?.end_datetime ? new Date(eventData.end_datetime) : undefined
  );
  const [startTime, setStartTime] = useState(
    eventData?.start_datetime && eventData.start_datetime.includes('T')
      ? eventData.start_datetime.split('T')[1].substring(0, 5)
      : ''
  );
  const [endTime, setEndTime] = useState(
    eventData?.end_datetime && eventData.end_datetime.includes('T')
      ? eventData.end_datetime.split('T')[1].substring(0, 5)
      : ''
  );
  const [isAllDay, setIsAllDay] = useState(eventData?.is_all_day || false);
  const [location, setLocation] = useState(eventData?.location || '');
  const [assignee, setAssignee] = useState<{ type?: string; id?: string } | null>(
    eventData?.assignee_id && eventData?.assignee_type
      ? {
          type: eventData.assignee_type,
          id: eventData.assignee_id,
        }
      : null
  );
  const [syncEnabled, setSyncEnabled] = useState(eventData?.sync_enabled || false);
  const [sendNotification, setSendNotification] = useState(false);

  // Service state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { toast } = useToast();

  // Determine allowed assignee types based on entity type
  const allowedAssigneeTypes = useMemo<AssigneeType[]>(() => {
    switch (entityType) {
      case 'schedule_item':
        // Schedule items can only be assigned to employees and subcontractors
        return ['employee', 'subcontractor'];
      case 'work_order':
        // Work orders can only be assigned to employees
        return ['employee'];
      case 'time_entry':
        // Time entries are only for employees
        return ['employee'];
      case 'project_milestone':
        // Milestones can be assigned to employees and subcontractors
        return ['employee', 'subcontractor'];
      case 'contact_interaction':
        // All types are allowed for contact interactions
        return ['employee', 'subcontractor', 'vendor'];
      default:
        // Default to employee only for safety
        return ['employee'];
    }
  }, [entityType]);

  // Check if Google Calendar is authorized
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      console.log('[CalendarEventForm] Checking auth...');
      try {
        const authorized = await googleCalendarService.isAuthorized();
        console.log(
          '[CalendarEventForm] googleCalendarService.isAuthorized() returned:',
          authorized
        );
        setIsAuthorized(authorized);
        console.log('[CalendarEventForm] State after setIsAuthorized:', authorized);
      } catch (error) {
        console.error('[CalendarEventForm] Error checking authorization:', error);
        setIsAuthorized(false);
      } finally {
        setIsCheckingAuth(false);
        console.log('[CalendarEventForm] Auth check complete. isCheckingAuth: false');
      }
    };

    if (open) {
      checkAuth();
    }
  }, [open]);

  // Reset form when event data changes
  useEffect(() => {
    if (open && eventData) {
      setTitle(eventData.title || '');
      setDescription(eventData.description || '');
      setStartDate(eventData.start_datetime ? new Date(eventData.start_datetime) : undefined);
      setEndDate(eventData.end_datetime ? new Date(eventData.end_datetime) : undefined);
      setStartTime(
        eventData.start_datetime && eventData.start_datetime.includes('T')
          ? eventData.start_datetime.split('T')[1].substring(0, 5)
          : ''
      );
      setEndTime(
        eventData.end_datetime && eventData.end_datetime.includes('T')
          ? eventData.end_datetime.split('T')[1].substring(0, 5)
          : ''
      );
      setIsAllDay(eventData.is_all_day || false);
      setLocation(eventData.location || '');
      setAssignee(
        eventData.assignee_id && eventData.assignee_type
          ? {
              type: eventData.assignee_type,
              id: eventData.assignee_id,
            }
          : null
      );
      setSyncEnabled(eventData.sync_enabled || false);
    }
  }, [eventData, open]);

  // Handle date and time changes
  useEffect(() => {
    if (startDate && startTime && !isAllDay) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const newDate = new Date(startDate);
      newDate.setHours(hours, minutes, 0, 0);
      setStartDate(newDate);
    }

    if (endDate && endTime && !isAllDay) {
      const [hours, minutes] = endTime.split(':').map(Number);
      const newDate = new Date(endDate);
      newDate.setHours(hours, minutes, 0, 0);
      setEndDate(newDate);
    }
  }, [startTime, endTime, isAllDay]);

  // Set default end time when start time changes (1 hour later)
  useEffect(() => {
    if (startDate && !endDate && !isAllDay) {
      const newEndDate = new Date(startDate);
      newEndDate.setHours(newEndDate.getHours() + 1);
      setEndDate(newEndDate);
      setEndTime(format(newEndDate, 'HH:mm'));
    }
  }, [startDate, endDate, isAllDay]);

  // Handle all-day event changes
  useEffect(() => {
    if (isAllDay) {
      // For all-day events, set times to start and end of day
      if (startDate) {
        const newStartDate = new Date(startDate);
        newStartDate.setHours(0, 0, 0, 0);
        setStartDate(newStartDate);
      }
      if (endDate) {
        const newEndDate = new Date(endDate);
        newEndDate.setHours(23, 59, 59, 999);
        setEndDate(newEndDate);
      }
    }
  }, [isAllDay]);

  // If assignee type isn't in allowed types, reset it
  useEffect(() => {
    if (assignee?.type && !allowedAssigneeTypes.includes(assignee.type as AssigneeType)) {
      setAssignee(null);
    }
  }, [assignee, allowedAssigneeTypes]);

  const handleSave = async () => {
    // Validate required fields
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the event.',
        variant: 'destructive',
      });
      return;
    }
    if (!startDate) {
      toast({
        title: 'Start Date required',
        description: 'Please select a start date for the event.',
        variant: 'destructive',
      });
      return;
    }
    if (!endDate) {
      toast({
        title: 'End Date required',
        description: 'Please select an end date for the event.',
        variant: 'destructive',
      });
      return;
    }
    if (!isAllDay && (!startTime || !endTime)) {
      toast({
        title: 'Time required',
        description: 'Please select both start and end times.',
        variant: 'destructive',
      });
      return;
    }
    if (endDate < startDate) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    // Validate assignee type if present
    if (assignee && !allowedAssigneeTypes.includes(assignee.type as AssigneeType)) {
      toast({
        title: 'Invalid assignee type',
        description: `${entityType} can only be assigned to ${allowedAssigneeTypes.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Prepare calendar event data
    const calendarEventData: Partial<ICalendarEventBase> = {
      ...(eventData?.id ? { id: eventData.id } : {}),
      title: title.trim(),
      description: description || null,
      start_datetime: startDate.toISOString(),
      end_datetime: endDate.toISOString(),
      is_all_day: isAllDay,
      location: location || null,
      assignee_type: assignee?.type as AssigneeType,
      assignee_id: assignee?.id || null,
      entity_type: entityType,
      entity_id: entityId,
      sync_enabled: syncEnabled,
      ...(projectId ? { project_id: projectId } : {}),
    };

    // Save the event
    try {
      const success = await onSave(calendarEventData);

      if (success) {
        // Sync with Google Calendar if enabled
        if (syncEnabled && isAuthorized) {
          try {
            await googleCalendarService.syncEntityWithCalendar(entityType, entityId);
            toast({
              title: 'Calendar Event Synced',
              description: 'The event has been synced with Google Calendar.',
            });
          } catch (error) {
            console.error('Error syncing with Google Calendar:', error);
            toast({
              title: 'Calendar Sync Error',
              description: 'Could not sync with Google Calendar. Please try again later.',
              variant: 'destructive',
            });
          }
        }

        // Close the dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Save Error',
        description: 'Could not save the event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        // Only allow closing if dropdown is not open
        if (!isDropdownOpen) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onPointerDownOutside={e => {
          // Prevent dialog from closing when clicking on dropdown options
          if (isDropdownOpen) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && <DialogDescription>{dialogDescription}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter event title"
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
              value={description || ''}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="allDay"
              checked={isAllDay}
              onCheckedChange={checked => setIsAllDay(Boolean(checked))}
            />
            <Label htmlFor="allDay" className="text-sm font-medium">
              All-day event
            </Label>
          </div>

          {/* Date/Time Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date {!isAllDay && '& Time'} *
              </Label>
              <div className="flex gap-2 mt-1">
                <DatePicker date={startDate} setDate={setStartDate} />
                {!isAllDay && (
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-[110px] h-9"
                    required
                  />
                )}
              </div>
            </div>
            {/* End Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date {!isAllDay && '& Time'} *
              </Label>
              <div className="flex gap-2 mt-1">
                <DatePicker date={endDate} setDate={setEndDate} />
                {!isAllDay && (
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-[110px] h-9"
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="location"
              value={location || ''}
              onChange={e => setLocation(e.target.value)}
              placeholder="Enter location (optional)"
              className="mt-1"
            />
          </div>

          <Separator className="my-4" />

          {/* Assignee Selector */}
          <div className="mb-2">
            <Label className="text-sm font-medium block mb-2">
              <UserCircle className="h-4 w-4 inline-block mr-1" />
              Assign To (Optional)
            </Label>
            <div className="assignee-selector-container">
              <AssigneeSelector
                value={assignee}
                onChange={selected => setAssignee(selected)}
                onDropdownOpenChange={setIsDropdownOpen}
                allowedTypes={allowedAssigneeTypes}
              />
            </div>
          </div>

          <Separator className="my-4" />

          {/* Google Calendar Integration */}
          <div className="flex items-center space-x-2 mt-3">
            <Checkbox
              id="syncEnabled"
              checked={syncEnabled}
              onCheckedChange={checked => setSyncEnabled(Boolean(checked))}
              disabled={!isAuthorized || isCheckingAuth}
            />
            <Label
              htmlFor="syncEnabled"
              className={`text-sm font-medium ${
                !isAuthorized || isCheckingAuth ? 'text-muted-foreground' : ''
              }`}
            >
              <Calendar className="h-4 w-4 inline-block mr-1" />
              Sync with Google Calendar
              {!isAuthorized && !isCheckingAuth && (
                <span className="text-xs ml-2 text-destructive">
                  (Google Calendar not connected)
                </span>
              )}
              {isCheckingAuth && <span className="text-xs ml-2">(Checking authorization...)</span>}
            </Label>
          </div>

          {/* Send Notification */}
          {syncEnabled && assignee && (
            <div className="flex items-center space-x-2 mt-3 ml-6">
              <Checkbox
                id="sendNotification"
                checked={sendNotification}
                onCheckedChange={checked => setSendNotification(Boolean(checked))}
                disabled={!syncEnabled || !assignee}
              />
              <Label
                htmlFor="sendNotification"
                className={`text-sm font-medium ${
                  !syncEnabled || !assignee ? 'text-muted-foreground' : ''
                }`}
              >
                <Mail className="h-4 w-4 inline-block mr-1" />
                Send calendar invite to assignee
              </Label>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Check className="h-4 w-4 mr-1" />
            {eventData?.id ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
