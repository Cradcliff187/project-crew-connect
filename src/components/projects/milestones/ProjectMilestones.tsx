
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import MilestoneItem from './MilestoneItem';
import MilestoneFormDialog from './MilestoneFormDialog';
import { useMilestones, ProjectMilestone } from './hooks/useMilestones';

interface ProjectMilestonesProps {
  projectId: string;
}

const ProjectMilestones = ({ projectId }: ProjectMilestonesProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  
  const { 
    loading, 
    error, 
    milestones, 
    completedCount, 
    totalCount, 
    progressPercentage,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    toggleMilestoneComplete
  } = useMilestones(projectId);
  
  const handleOpenDialog = (milestone?: ProjectMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
    } else {
      setEditingMilestone(null);
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMilestone(null);
  };
  
  const handleSaveMilestone = async (title: string, description: string, dueDate: Date | undefined) => {
    if (editingMilestone) {
      // Update existing milestone
      return await updateMilestone(editingMilestone.id, title, description, dueDate);
    } else {
      // Create new milestone
      return await addMilestone(title, description, dueDate);
    }
  };
  
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
                <MilestoneItem
                  key={milestone.id}
                  milestone={milestone}
                  onEdit={handleOpenDialog}
                  onDelete={deleteMilestone}
                  onToggleComplete={toggleMilestoneComplete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <MilestoneFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingMilestone={editingMilestone}
        onSave={handleSaveMilestone}
        onCancel={handleCloseDialog}
      />
    </>
  );
};

export default ProjectMilestones;
