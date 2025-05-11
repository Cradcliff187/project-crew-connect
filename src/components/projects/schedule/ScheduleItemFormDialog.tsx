import { useState, useEffect } from 'react';
import { Check, X, Calendar, UserCircle, Mail, Clock } from 'lucide-react';
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

// Define the type for the assignee value
type AssigneeValue =
  | {
      type: 'employee' | 'subcontractor' | 'vendor';
      id: string;
    }[]
  | null;

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
      : ''
  );
  const [endTime, setEndTime] = useState(
    editingItem?.end_datetime && editingItem.end_datetime.includes('T')
      ? editingItem.end_datetime.split('T')[1].substring(0, 5)
      : ''
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
  const [sendInvite, setSendInvite] = useState(editingItem?.send_invite || false);

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
          : ''
      );
      setEndTime(
        editingItem?.end_datetime && editingItem.end_datetime.includes('T')
          ? editingItem.end_datetime.split('T')[1].substring(0, 5)
          : ''
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
      setSendInvite(editingItem?.send_invite || false);
    }
  }, [editingItem, open]);

  // Handle date and time changes to ensure valid datetime
  useEffect(() => {
    if (startDate && startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const newDate = new Date(startDate);
      newDate.setHours(hours, minutes, 0, 0);
      setStartDate(newDate);
    }

    if (endDate && endTime) {
      const [hours, minutes] = endTime.split(':').map(Number);
      const newDate = new Date(endDate);
      newDate.setHours(hours, minutes, 0, 0);
      setEndDate(newDate);
    }
  }, [startTime, endTime]);

  const handleSave = async () => {
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
    if (endDate <= startDate) {
      toast({
        title: 'Invalid Date Range',
        description: 'End date and time must be after the start date and time.',
        variant: 'destructive',
      });
      return;
    }
    if (sendInvite && (!assignees || assignees.length === 0)) {
      toast({
        title: 'Assignee Required for Invite',
        description: 'Please select at least one assignee before enabling calendar invites.',
        variant: 'destructive',
      });
      return;
    }

    // For now, use the first assignee since the database schema doesn't support multiple
    // In future we may want to update the schema or create multiple schedule items
    const primaryAssignee = assignees && assignees.length > 0 ? assignees[0] : null;

    const itemData: Partial<ScheduleItem> = {
      ...(editingItem ? { id: editingItem.id } : {}), // Include ID if editing
      project_id: projectId,
      title: title.trim(),
      description: description || null,
      start_datetime: startDate.toISOString(),
      end_datetime: endDate.toISOString(),
      assignee_type:
        primaryAssignee?.type === 'employee' || primaryAssignee?.type === 'subcontractor'
          ? primaryAssignee.type
          : null,
      assignee_id: primaryAssignee?.id || null,
      send_invite: primaryAssignee ? sendInvite : false, // Only send invite if assignee exists
      // calendar_integration_enabled could be set based on send_invite or other logic
      calendar_integration_enabled: primaryAssignee ? sendInvite : false,
    };

    const success = await onSave(itemData);
    if (success) {
      // Optionally reset form or let the parent component handle closing/resetting
      // resetForm(); // Decided against resetting here, parent closes dialog
      onOpenChange(false); // Close dialog on successful save
    }
  };

  // Reset form fields (currently not called automatically on save success)
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('');
    setEndTime('');
    setAssignees(null);
    setSendInvite(false);
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
                  // Disable send invite if no assignees
                  if (!selected || selected.length === 0) {
                    setSendInvite(false);
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
