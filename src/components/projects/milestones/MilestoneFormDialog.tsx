import { useState } from 'react';
import { Check, X, Calendar, UserCircle, Clock, BarChart } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ProjectMilestone,
  MilestoneStatus,
  MilestonePriority,
  AssigneeType,
} from './hooks/useMilestones';
import { useToast } from '@/hooks/use-toast';
import { CalendarIntegrationToggle } from '@/components/common/CalendarIntegrationToggle';
import { AssigneeSelector } from '@/components/common/AssigneeSelector';
import { Separator } from '@/components/ui/separator';

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
  const [title, setTitle] = useState(editingMilestone?.title || '');
  const [description, setDescription] = useState(editingMilestone?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editingMilestone?.due_date ? new Date(editingMilestone.due_date) : undefined
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(
    editingMilestone?.calendar_sync_enabled || false
  );

  // New state for enhanced fields
  const [startDate, setStartDate] = useState<Date | undefined>(
    editingMilestone?.start_date ? new Date(editingMilestone.start_date) : undefined
  );
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false);
  const [status, setStatus] = useState<MilestoneStatus>(editingMilestone?.status || 'not_started');
  const [priority, setPriority] = useState<MilestonePriority>(
    editingMilestone?.priority || 'medium'
  );
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(
    editingMilestone?.estimated_hours || undefined
  );
  const [assignee, setAssignee] = useState<{ type?: string; id?: string } | null>(
    editingMilestone?.assignee_id
      ? {
          type: editingMilestone.assignee_type || undefined,
          id: editingMilestone.assignee_id,
        }
      : null
  );

  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for the task',
        variant: 'destructive',
      });
      return;
    }

    // Prepare additional fields
    const additionalFields: Partial<ProjectMilestone> = {
      start_date: startDate,
      status,
      priority,
      estimated_hours: estimatedHours,
      assignee_type: assignee?.type as AssigneeType | undefined,
      assignee_id: assignee?.id,
    };

    const success = await onSave(
      title,
      description,
      dueDate,
      calendarSyncEnabled,
      additionalFields
    );
    if (success) {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setStartDate(undefined);
    setStatus('not_started');
    setPriority('medium');
    setEstimatedHours(undefined);
    setAssignee(null);
    setCalendarSyncEnabled(false);
  };

  // Format status for display
  const formatStatus = (status: MilestoneStatus): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format priority for display
  const formatPriority = (priority: MilestonePriority): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingMilestone ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {editingMilestone
              ? 'Update the details for this task.'
              : 'Fill in the details to create a new task for this project.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium block mb-1">
              Title *
            </label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium block mb-1">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Status</label>
              <Select value={status} onValueChange={value => setStatus(value as MilestoneStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">{formatStatus('not_started')}</SelectItem>
                  <SelectItem value="in_progress">{formatStatus('in_progress')}</SelectItem>
                  <SelectItem value="completed">{formatStatus('completed')}</SelectItem>
                  <SelectItem value="blocked">{formatStatus('blocked')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Priority</label>
              <Select
                value={priority}
                onValueChange={value => setPriority(value as MilestonePriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{formatPriority('low')}</SelectItem>
                  <SelectItem value="medium">{formatPriority('medium')}</SelectItem>
                  <SelectItem value="high">{formatPriority('high')}</SelectItem>
                  <SelectItem value="urgent">{formatPriority('urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Start Date</label>
              <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={date => {
                      setStartDate(date);
                      setStartDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Due Date</label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={date => {
                      setDueDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label htmlFor="estimatedHours" className="text-sm font-medium block mb-1">
              <Clock className="h-4 w-4 inline-block mr-1" />
              Estimated Hours
            </label>
            <Input
              id="estimatedHours"
              type="number"
              min="0"
              step="0.5"
              value={estimatedHours || ''}
              onChange={e => setEstimatedHours(parseFloat(e.target.value) || undefined)}
              placeholder="Enter estimated hours"
            />
          </div>

          <Separator className="my-2" />

          <div>
            <label className="text-sm font-medium block mb-2">
              <UserCircle className="h-4 w-4 inline-block mr-1" />
              Assign To
            </label>
            <AssigneeSelector value={assignee} onChange={setAssignee} />
          </div>

          <Separator className="my-2" />

          {/* Google Calendar Integration */}
          <div className="mt-6">
            <CalendarIntegrationToggle
              value={calendarSyncEnabled}
              onChange={setCalendarSyncEnabled}
              disabled={!dueDate}
              disabledReason="A due date is required for calendar integration."
              label="Google Calendar Integration"
              description="Add this task as an event in Google Calendar"
              entityType="project_milestone"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Check className="h-4 w-4 mr-1" />
            {editingMilestone ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneFormDialog;
