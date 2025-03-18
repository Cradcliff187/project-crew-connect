
import { useState } from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ProjectMilestone } from './hooks/useMilestones';

interface MilestoneFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMilestone: ProjectMilestone | null;
  onSave: (title: string, description: string, dueDate: Date | undefined) => Promise<boolean>;
  onCancel: () => void;
}

const MilestoneFormDialog = ({ 
  open, 
  onOpenChange, 
  editingMilestone, 
  onSave, 
  onCancel 
}: MilestoneFormDialogProps) => {
  const [title, setTitle] = useState(editingMilestone?.title || '');
  const [description, setDescription] = useState(editingMilestone?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editingMilestone?.due_date ? new Date(editingMilestone.due_date) : undefined
  );
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }
    
    const success = await onSave(title, description, dueDate);
    if (success) {
      resetForm();
    }
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingMilestone ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium block mb-1">Title *</label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter task title" 
            />
          </div>
          
          <div>
            <label htmlFor="description" className="text-sm font-medium block mb-1">Description</label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter task description" 
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1">Due Date</label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
