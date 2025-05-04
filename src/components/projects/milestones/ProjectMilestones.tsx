import { useState, useMemo, useCallback } from 'react';
import { Plus, Filter, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import MilestoneItem from './MilestoneItem';
import MilestoneFormDialog from './MilestoneFormDialog';
import ScheduleItemFormDialog, { ScheduleItem } from '../schedule/ScheduleItemFormDialog';
import { useScheduleItems } from '../schedule/hooks/useScheduleItems';
import {
  useMilestones,
  ProjectMilestone,
  MilestoneStatus,
  MilestonePriority,
} from './hooks/useMilestones';
import { useToast } from '@/hooks/use-toast';

interface ProjectMilestonesProps {
  projectId: string;
}

type SortField = 'due_date' | 'start_date' | 'priority' | 'status';
type SortOrder = 'asc' | 'desc';

const ProjectMilestones = ({ projectId }: ProjectMilestonesProps) => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const { toast } = useToast();

  const {
    loading: milestonesLoading,
    error: milestonesError,
    milestones,
    completedCount,
    totalCount,
    progressPercentage,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestoneComplete,
  } = useMilestones(projectId);

  const {
    scheduleItems,
    loading: scheduleLoading,
    error: scheduleError,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
  } = useScheduleItems(projectId);

  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<MilestonePriority | null>(null);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('due_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredMilestones = useMemo(() => {
    return milestones
      .filter(milestone => {
        if (statusFilter && milestone.status !== statusFilter) return false;
        if (priorityFilter && milestone.priority !== priorityFilter) return false;
        if (assigneeFilter && milestone.assignee_id !== assigneeFilter) return false;
        if (!showCompleted && milestone.is_completed) return false;
        return true;
      })
      .sort((a, b) => {
        let aValue: any = a[sortBy];
        let bValue: any = b[sortBy];

        if (aValue === undefined || aValue === null) return sortOrder === 'asc' ? -1 : 1;
        if (bValue === undefined || bValue === null) return sortOrder === 'asc' ? 1 : -1;

        if (sortBy === 'due_date' || sortBy === 'start_date') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (sortBy === 'priority') {
          const priorityRank = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityRank[aValue as MilestonePriority] || 0;
          bValue = priorityRank[bValue as MilestonePriority] || 0;
        }

        if (sortBy === 'status') {
          const statusRank = { not_started: 1, in_progress: 2, blocked: 3, completed: 4 };
          aValue = statusRank[aValue as MilestoneStatus] || 0;
          bValue = statusRank[bValue as MilestoneStatus] || 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [milestones, statusFilter, priorityFilter, assigneeFilter, showCompleted, sortBy, sortOrder]);

  const handleOpenScheduleDialog = (item?: ScheduleItem) => {
    setEditingScheduleItem(item || null);
    setScheduleDialogOpen(true);
  };

  const handleCloseScheduleDialog = () => {
    setScheduleDialogOpen(false);
    setEditingScheduleItem(null);
  };

  const handleOpenMilestoneDialog = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone);
    setMilestoneDialogOpen(true);
  };

  const handleCloseMilestoneDialog = () => {
    setMilestoneDialogOpen(false);
    setEditingMilestone(null);
  };

  const handleSaveScheduleItem = useCallback(
    async (itemData: Partial<ScheduleItem>): Promise<boolean> => {
      let savedItem: ScheduleItem | null = null;
      let success = false;
      try {
        if (editingScheduleItem) {
          savedItem = await updateScheduleItem(editingScheduleItem.id, itemData);
          success = !!savedItem;
        } else {
          savedItem = await addScheduleItem(itemData);
          success = !!savedItem;
        }

        if (success && savedItem && savedItem.send_invite && savedItem.assignee_id) {
          console.log('TODO: Trigger backend calendar sync/invite for item:', savedItem.id);
          toast({ title: 'Calendar Sync', description: 'Sending calendar invite...' });
        }

        return success;
      } catch (error) {
        console.error('Error saving schedule item:', error);
        return false;
      }
    },
    [projectId, editingScheduleItem, addScheduleItem, updateScheduleItem, toast]
  );

  const handleSaveMilestone = async (
    title: string,
    description: string,
    dueDate: Date | undefined,
    calendarSync: boolean,
    additionalFields?: Partial<ProjectMilestone>
  ): Promise<boolean> => {
    if (!editingMilestone) return false;

    const result = await updateMilestone(
      editingMilestone.id,
      title,
      description,
      dueDate,
      calendarSync,
      additionalFields
    );

    if (result) {
      setMilestoneDialogOpen(false);
      setEditingMilestone(null);
    }
    return result;
  };

  const handleDeleteMilestone = async (id: string) => {
    const milestone = milestones.find(m => m.id === id);

    try {
      await deleteMilestone(id);
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setPriorityFilter(null);
    setAssigneeFilter(null);
    setShowCompleted(true);
    setSortBy('due_date');
    setSortOrder('asc');
  };

  const isLoading = milestonesLoading || scheduleLoading;
  const combinedError = milestonesError || scheduleError;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-6" />
          {[1, 2, 3].map(i => (
            <div key={i} className="mb-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (combinedError) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500 mb-2">Error loading data</p>
          <p className="text-sm text-muted-foreground mb-4">{combinedError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tasks & Milestones</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'not_started'}
                  onCheckedChange={() =>
                    setStatusFilter(statusFilter === 'not_started' ? null : 'not_started')
                  }
                >
                  Not Started
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'in_progress'}
                  onCheckedChange={() =>
                    setStatusFilter(statusFilter === 'in_progress' ? null : 'in_progress')
                  }
                >
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'completed'}
                  onCheckedChange={() =>
                    setStatusFilter(statusFilter === 'completed' ? null : 'completed')
                  }
                >
                  Completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter === 'blocked'}
                  onCheckedChange={() =>
                    setStatusFilter(statusFilter === 'blocked' ? null : 'blocked')
                  }
                >
                  Blocked
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'low'}
                  onCheckedChange={() => setPriorityFilter(priorityFilter === 'low' ? null : 'low')}
                >
                  Low
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'medium'}
                  onCheckedChange={() =>
                    setPriorityFilter(priorityFilter === 'medium' ? null : 'medium')
                  }
                >
                  Medium
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'high'}
                  onCheckedChange={() =>
                    setPriorityFilter(priorityFilter === 'high' ? null : 'high')
                  }
                >
                  High
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={priorityFilter === 'urgent'}
                  onCheckedChange={() =>
                    setPriorityFilter(priorityFilter === 'urgent' ? null : 'urgent')
                  }
                >
                  Urgent
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Show Completed</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={showCompleted}
                  onCheckedChange={setShowCompleted}
                >
                  Show Completed Tasks
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'due_date'}
                  onCheckedChange={() => sortBy !== 'due_date' && setSortBy('due_date')}
                >
                  Due Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'start_date'}
                  onCheckedChange={() => sortBy !== 'start_date' && setSortBy('start_date')}
                >
                  Start Date
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'priority'}
                  onCheckedChange={() => sortBy !== 'priority' && setSortBy('priority')}
                >
                  Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'status'}
                  onCheckedChange={() => sortBy !== 'status' && setSortBy('status')}
                >
                  Status
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <DropdownMenuCheckboxItem
                  checked={sortOrder === 'asc'}
                  onCheckedChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={clearFilters}>Clear All Filters</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => handleOpenScheduleDialog()}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Schedule Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {totalCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Overall Progress</span>
                <span className="text-sm font-medium">
                  {completedCount}/{totalCount} complete
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks or milestones have been added yet.</p>
              <p className="text-sm mt-2">
                Click "Add Schedule Item" to create your first project task.
              </p>
            </div>
          ) : filteredMilestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks match your current filters.</p>
              <Button variant="link" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMilestones.map(milestone => (
                <MilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  onEdit={handleOpenMilestoneDialog}
                  onDelete={handleDeleteMilestone}
                  onToggleComplete={toggleMilestoneComplete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ScheduleItemFormDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        editingItem={editingScheduleItem}
        projectId={projectId}
        onSave={handleSaveScheduleItem}
        onCancel={handleCloseScheduleDialog}
      />

      <MilestoneFormDialog
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
        editingMilestone={editingMilestone}
        onSave={handleSaveMilestone}
        onCancel={handleCloseMilestoneDialog}
      />
    </>
  );
};

export default ProjectMilestones;
