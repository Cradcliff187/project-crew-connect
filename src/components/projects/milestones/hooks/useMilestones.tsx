
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProjectMilestone {
  id: string;
  projectid: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useMilestones = (projectId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('projectid', projectId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setMilestones(data as ProjectMilestone[]);
    } catch (error: any) {
      console.error('Error fetching project milestones:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = async (
    title: string,
    description: string | null,
    dueDate: Date | undefined
  ) => {
    try {
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
      
      setMilestones([...milestones, data[0] as ProjectMilestone]);
      
      toast({
        title: 'Milestone added',
        description: 'A new milestone has been added to the project.',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error saving milestone',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const updateMilestone = async (
    id: string,
    title: string,
    description: string | null,
    dueDate: Date | undefined
  ) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({
          title,
          description: description || null,
          due_date: dueDate ? dueDate.toISOString() : null,
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setMilestones(milestones.map(m => 
        m.id === id 
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
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating milestone',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  const deleteMilestone = async (id: string) => {
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
        
        return true;
      } catch (error: any) {
        toast({
          title: 'Error deleting milestone',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
    }
    return false;
  };

  const toggleMilestoneComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update({ is_completed: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      setMilestones(milestones.map(m => 
        m.id === id ? { ...m, is_completed: !currentStatus } : m
      ));
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating milestone',
        description: error.message,
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
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
  };
};
