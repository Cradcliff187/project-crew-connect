
import { Calendar, Pencil, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ProjectMilestone } from './hooks/useMilestones';

interface MilestoneItemProps {
  milestone: ProjectMilestone;
  onEdit: (milestone: ProjectMilestone) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string, currentStatus: boolean) => void;
}

const MilestoneItem = ({ 
  milestone,
  onEdit,
  onDelete,
  onToggleComplete
}: MilestoneItemProps) => {
  return (
    <div 
      className={`flex items-start p-3 border rounded-md ${milestone.is_completed ? 'bg-muted/50' : ''}`}
    >
      <Checkbox 
        checked={milestone.is_completed}
        onCheckedChange={() => onToggleComplete(milestone.id, milestone.is_completed)}
        className="mt-1 mr-3"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={`font-medium ${milestone.is_completed ? 'line-through text-muted-foreground' : ''}`}>
            {milestone.title}
          </h4>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(milestone)} 
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(milestone.id)} 
              className="h-8 w-8 text-red-500"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {milestone.description && (
          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
        )}
        {milestone.due_date && (
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Due {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneItem;
