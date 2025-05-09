import { Clock, CalendarCheck, User, Pencil, Trash, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectMilestone, MilestonePriority, MilestoneStatus } from './hooks/useMilestones';

interface MilestoneItemProps {
  milestone: ProjectMilestone;
  onEdit: (milestone: ProjectMilestone) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
}

const MilestoneItem: React.FC<MilestoneItemProps> = ({
  milestone,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  // Function to format status
  const formatStatus = (status?: MilestoneStatus): string => {
    if (!status) return 'Not Started';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to get status badge variant
  const getStatusVariant = (
    status?: MilestoneStatus
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!status) return 'outline';
    switch (status) {
      case 'not_started':
        return 'outline';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Function to get priority badge variant
  const getPriorityVariant = (
    priority?: MilestonePriority
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!priority) return 'outline';
    switch (priority) {
      case 'low':
        return 'outline';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'default';
      case 'urgent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Function to format priority
  const formatPriority = (priority?: MilestonePriority): string => {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="border rounded-md p-4 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={milestone.is_completed}
            onCheckedChange={() => onToggleComplete(milestone.id, milestone.is_completed)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3
              className={`font-medium ${milestone.is_completed ? 'line-through text-gray-500' : ''}`}
            >
              {milestone.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* Status Badge */}
              <Badge variant={getStatusVariant(milestone.status)}>
                {formatStatus(milestone.status)}
              </Badge>

              {/* Priority Badge */}
              {milestone.priority && (
                <Badge variant={getPriorityVariant(milestone.priority)}>
                  {formatPriority(milestone.priority)}
                </Badge>
              )}

              {/* Calendar indicator */}
              {milestone.calendar_sync_enabled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1">
                        <CalendarCheck className="h-3 w-3" />
                        <span>Calendar</span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Synced with Google Calendar</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {/* Description */}
          {milestone.description && (
            <p
              className={`text-sm mt-1 ${milestone.is_completed ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {milestone.description}
            </p>
          )}

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-sm">
            <div className="flex flex-wrap gap-3">
              {/* Date display */}
              <div className="flex items-center text-muted-foreground text-xs">
                {milestone.start_date && (
                  <span className="flex items-center mr-3">
                    <Clock className="h-3 w-3 mr-1" />
                    Start: {format(new Date(milestone.start_date), 'MMM d')}
                  </span>
                )}
                {milestone.due_date && (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due: {format(new Date(milestone.due_date), 'MMM d')}
                  </span>
                )}
              </div>

              {/* Estimated hours */}
              {milestone.estimated_hours && (
                <div className="flex items-center text-muted-foreground text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {milestone.estimated_hours} hrs
                </div>
              )}

              {/* Assignee */}
              {milestone.assignee_id && (
                <div className="flex items-center text-muted-foreground text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {milestone.assignee_type}: {milestone.assignee_id.substring(0, 8)}...
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 mt-2 sm:mt-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(milestone)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(milestone.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneItem;
