
import { useState, useEffect } from 'react';
import { Plus, Calendar, Check, Pencil, Trash, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ProjectMilestone {
  id: string;
  projectid: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectMilestonesProps {
  projectId: string;
}

const ProjectMilestones = ({ projectId }: ProjectMilestonesProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  useEffect(() => {
    const fetchMilestones = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('project_milestones')
          .select('*')
          .eq('projectid', projectId)
          .order('due_date', { ascending: true });
        
        if (error) throw error;
        setMilestones(data || []);
      } catch (error: any) {
        console.error('Error fetching project milestones:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMilestones();
  }, [projectId]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setEditingMilestone(null);
  };
  
  const handleOpenDialog = (milestone?: ProjectMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setTitle(milestone.title);
      setDescription(milestone.description || '');
      setDueDate(milestone.due_date ? new Date(milestone.due_date) : undefined);
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };
  
  const handleSaveMilestone = async () => {
    if (!title.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title for the milestone.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (editingMilestone) {
        // Update existing milestone
        const { error } = await supabase
          .from('project_milestones')
          .update({
            title,
            description: description || null,
            due_date: dueDate ? dueDate.toISOString() : null,
          })
          .eq('id', editingMilestone.id);
          
        if (error) throw error;
        
        setMilestones(milestones.map(m => 
          m.id === editingMilestone.id 
            ? {
                ...m, 
                title, 
                description: description || null, 
                due_date: dueDate ? dueDate.toISOString() : null
              } 
            : m
        ));
        
        toast({
          title: 'Milestone updated',
          description: 'The milestone has been updated successfully.',
        });
      } else {
        // Create new milestone
        const { data, error } = await supabase
          .from('project_milestones')
          .insert({
            projectid: projectId,
            title,
            description: description || null,
            due_date: dueDate ? dueDate.toISOString() : null,
            is_completed: false
          })
          .select();
          
        if (error) throw error;
        
        setMilestones([...milestones, data[0]]);
        
        toast({
          title: 'Milestone added',
          description: 'A new milestone has been added to the project.',
        });
      }
      
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error saving milestone',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteMilestone = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        const { error } = await supabase
          .from('project_milestones')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setMilestones(milestones.filter(m => m.id !== id));
        
        toast({
          title: 'Milestone deleted',
          description: 'The milestone has been removed from the project.',
        });
      } catch (error: any) {
        toast({
          title: 'Error deleting milestone',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  };
  
  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ is_completed: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setMilestones(milestones.map(m => 
        m.id === id ? { ...m, is_completed: !currentStatus } : m
      ));
    } catch (error: any) {
      toast({
        title: 'Error updating milestone',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  if (loading) {
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
  
  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500 mb-2">Error loading milestones</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
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
          <Button onClick={() => handleOpenDialog()} className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {totalCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Overall Progress</span>
                <span className="text-sm font-medium">{completedCount}/{totalCount} complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
          
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks or milestones have been added yet.</p>
              <p className="text-sm mt-2">Click "Add Task" to create your first project milestone.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`flex items-start p-3 border rounded-md ${milestone.is_completed ? 'bg-muted/50' : ''}`}
                >
                  <Checkbox 
                    checked={milestone.is_completed}
                    onCheckedChange={() => handleToggleComplete(milestone.id, milestone.is_completed)}
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
                          onClick={() => handleOpenDialog(milestone)} 
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteMilestone(milestone.id)} 
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Check className="h-4 w-4 mr-1" />
              {editingMilestone ? 'Update Task' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectMilestones;
