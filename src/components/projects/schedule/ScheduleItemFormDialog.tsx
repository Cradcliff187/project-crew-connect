import { useState, useEffect } from 'react';
import { Check, X, Calendar, UserCircle, Mail, Clock, CalendarCheck } from 'lucide-react';
import { format, parse } from 'date-fns';
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
import { AssigneeSelector, Assignee } from '@/components/common/AssigneeSelector';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AssigneeType } from '@/components/projects/milestones/hooks/useMilestones'; // Import AssigneeType
import { ScheduleItem } from '@/types/schedule'; // Import from our types file
import { EnhancedCalendarService } from '@/services/enhancedCalendarService';

// Define the type for the assignee value
type AssigneeValue =
  | {
      type: 'employee' | 'subcontractor' | 'vendor';
      id: string;
    }[]
  | null;

interface ScheduleItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: ScheduleItem | null;
  projectId: string; // Need project ID to associate the item
  projectName?: string; // Optional project name for context
  onSave: (itemData: Partial<ScheduleItem>) => Promise<boolean>; // Pass the whole object
  onCancel: () => void;
}

const ScheduleItemFormDialog = ({
  open,
  onOpenChange,
  editingItem,
  projectId,
  projectName,
  onSave,
  onCancel,
}: ScheduleItemFormDialogProps) => {
  const [title, setTitle] = useState(editingItem?.title || '');
  const [description, setDescription] = useState(editingItem?.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    editingItem?.start_datetime ? new Date(editingItem.start_datetime) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    editingItem?.end_datetime ? new Date(editingItem.end_datetime) : undefined
  );
  const [startTime, setStartTime] = useState(
    editingItem?.start_datetime && editingItem.start_datetime.includes('T')
      ? editingItem.start_datetime.split('T')[1].substring(0, 5)
      : '09:00'
  );
  const [endTime, setEndTime] = useState(
    editingItem?.end_datetime && editingItem.end_datetime.includes('T')
      ? editingItem.end_datetime.split('T')[1].substring(0, 5)
      : '10:00'
  );
  const [assignees, setAssignees] = useState<AssigneeValue>(
    editingItem?.assignee_id && editingItem?.assignee_type
      ? [
          {
            type: editingItem.assignee_type as 'employee' | 'subcontractor',
            id: editingItem.assignee_id,
          },
        ]
      : null
  );
  const [sendInvite, setSendInvite] = useState<boolean>(editingItem?.send_invite ?? true); // Default to true unless explicitly false

  const { toast } = useToast();

  // Reset form when editingItem changes
  useEffect(() => {
    if (open) {
      setTitle(editingItem?.title || '');
      setDescription(editingItem?.description || '');
      setStartDate(editingItem?.start_datetime ? new Date(editingItem.start_datetime) : undefined);
      setEndDate(editingItem?.end_datetime ? new Date(editingItem.end_datetime) : undefined);
      setStartTime(
        editingItem?.start_datetime && editingItem.start_datetime.includes('T')
          ? editingItem.start_datetime.split('T')[1].substring(0, 5)
          : '09:00'
      );
      setEndTime(
        editingItem?.end_datetime && editingItem.end_datetime.includes('T')
          ? editingItem.end_datetime.split('T')[1].substring(0, 5)
          : '10:00'
      );
      setAssignees(
        editingItem?.assignee_id && editingItem?.assignee_type
          ? [
              {
                type: editingItem.assignee_type as 'employee' | 'subcontractor',
                id: editingItem.assignee_id,
              },
            ]
          : null
      );
      setSendInvite(editingItem?.send_invite ?? true); // Default to true unless explicitly false
    }
  }, [editingItem, open]);

  // Auto-set end time based on start time (1 hour duration)
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHour = (hours + 1) % 24;
      setEndTime(`${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }
  }, [startTime]);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the schedule item.',
        variant: 'destructive',
      });
      return;
    }
    if (!startDate) {
      toast({
        title: 'Start Date & Time required',
        description: 'Please select a start date and time.',
        variant: 'destructive',
      });
      return;
    }
    if (!endDate) {
      toast({
        title: 'End Date & Time required',
        description: 'Please select an end date and time.',
        variant: 'destructive',
      });
      return;
    }

    // Create proper datetime objects
    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date and time must be after the start date and time.',
        variant: 'destructive',
      });
      return;
    }

    // For now, use the first assignee since the database schema doesn't support multiple
    const primaryAssignee = assignees && assignees.length > 0 ? assignees[0] : null;

    const itemData: Partial<ScheduleItem> = {
      ...(editingItem ? { id: editingItem.id } : {}), // Include ID if editing
      project_id: projectId,
      title: title.trim(),
      description: description || null,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      assignee_type:
        primaryAssignee?.type === 'employee' || primaryAssignee?.type === 'subcontractor'
          ? primaryAssignee.type
          : null,
      assignee_id: primaryAssignee?.id || null,
      send_invite: primaryAssignee ? sendInvite : false, // Only send invite if assignee exists
      calendar_integration_enabled: true, // Always enabled for project schedule items
    };

    try {
      console.log('Creating schedule item in database...', itemData);

      // Step 1: Create schedule item in database FIRST using our new API
      const response = await fetch('/api/schedule-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create schedule item');
      }

      const { data: createdItem } = await response.json();
      console.log('Schedule item created successfully:', createdItem);

      // Step 2: Sync with Google Calendar
      try {
        const syncResponse = await fetch(`/api/schedule-items/${createdItem.id}/sync-calendar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const syncResult = await syncResponse.json();

        if (syncResult.success) {
          toast({
            title: editingItem ? 'Schedule Item Updated' : 'Schedule Item Created Successfully! 📅',
            description: `Schedule item saved and synced to AJC Projects Calendar. Event ID: ${syncResult.eventId}`,
          });
        } else {
          toast({
            title: editingItem ? 'Schedule Item Updated' : 'Schedule Item Created',
            description:
              'Schedule item saved but Google Calendar sync failed. You can retry sync later.',
            variant: 'destructive',
          });
        }
      } catch (syncError) {
        console.warn('Calendar sync failed:', syncError);
        toast({
          title: editingItem ? 'Schedule Item Updated' : 'Schedule Item Created',
          description:
            'Schedule item saved but Google Calendar sync failed. You can retry sync later.',
          variant: 'destructive',
        });
      }

      // Notify parent component of successful save (for UI updates)
      await onSave(itemData);

      onOpenChange(false); // Close dialog on successful save
    } catch (error) {
      console.error('Error creating schedule item:', error);
      toast({
        title: 'Failed to Create Schedule Item',
        description: error instanceof Error ? error.message : 'Failed to create schedule item',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Schedule Item' : 'Add Schedule Item'}</DialogTitle>
          <DialogDescription>
            {editingItem
              ? 'Update the details for this scheduled item.'
              : 'Schedule a specific task or event for this project.'}
            {projectName && (
              <span className="block mt-1 text-xs text-muted-foreground">
                Project: {projectName}
              </span>
            )}
          </DialogDescription>
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
              placeholder="Enter item title (e.g., Plumbing Rough-in)"
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
              placeholder="Enter details about the scheduled item (optional)"
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Date/Time Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date & Time *
              </Label>
              <div className="flex gap-2 mt-1">
                <DatePicker date={startDate} setDate={setStartDate} />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-[110px] h-9" // Match button height
                  required
                />
              </div>
            </div>
            {/* End Date/Time */}
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                End Date & Time *
              </Label>
              <div className="flex gap-2 mt-1">
                <DatePicker date={endDate} setDate={setEndDate} />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-[110px] h-9" // Match button height
                  required
                />
              </div>
            </div>
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
                value={assignees}
                onChange={selected => {
                  setAssignees(selected);
                  // Auto-enable send invite if assignees are selected
                  if (selected && selected.length > 0 && !sendInvite) {
                    setSendInvite(true);
                  }
                }}
                allowedTypes={['employee', 'subcontractor']}
                multiple={true}
                maxHeight={250}
              />
            </div>
          </div>

          {/* Send Invite Checkbox */}
          <div className="flex items-center space-x-2 mt-3">
            <Checkbox
              id="sendInvite"
              checked={sendInvite}
              onCheckedChange={checked => setSendInvite(Boolean(checked))}
              disabled={!assignees || assignees.length === 0} // Disable if no assignees selected
            />
            <Label
              htmlFor="sendInvite"
              className={`text-sm font-medium ${!assignees || assignees.length === 0 ? 'text-muted-foreground' : ''}`}
            >
              <Mail className="h-4 w-4 inline-block mr-1" />
              Send Google Calendar invite to assignee(s)
              {(!assignees || assignees.length === 0) && (
                <span className="text-xs"> (Requires Assignee)</span>
              )}
            </Label>
          </div>

          {/* Automatic Calendar Sync Notification */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-3">
              <CalendarCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Automatic Calendar Integration</p>
                <p className="text-sm text-blue-700 mt-1">
                  This schedule item will be automatically added to your{' '}
                  <strong>AJC Projects Calendar</strong> when saved.
                  {assignees &&
                    assignees.length > 0 &&
                    sendInvite &&
                    ' Selected assignees will receive calendar invites automatically.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Check className="h-4 w-4 mr-1" />
            {editingItem ? 'Update Schedule Item' : 'Add Schedule Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleItemFormDialog;
