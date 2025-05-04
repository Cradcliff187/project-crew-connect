import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type MilestonePriority = 'low' | 'medium' | 'high' | 'urgent';
export type AssigneeType = 'employee' | 'vendor' | 'subcontractor';

export interface ProjectMilestone {
  id: string;
  projectid: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  calendar_sync_enabled?: boolean;
  calendar_event_id?: string | null;
  assignee_type?: AssigneeType | null;
  assignee_id?: string | null;
  start_date?: string | null;
  priority?: MilestonePriority;
  status?: MilestoneStatus;
  estimated_hours?: number | null;
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
    dueDate: Date | undefined,
    calendarSyncEnabled: boolean = false,
    additionalFields?: Partial<ProjectMilestone>
  ) => {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          projectid: projectId,
          title,
          description: description || null,
          due_date: dueDate ? dueDate.toISOString() : null,
          is_completed: false,
          calendar_sync_enabled: calendarSyncEnabled,
          ...(additionalFields || {}),
          status: additionalFields?.status || 'not_started',
          priority: additionalFields?.priority || 'medium',
          ...(additionalFields?.start_date && typeof additionalFields.start_date !== 'string'
            ? { start_date: (additionalFields.start_date as Date).toISOString() }
            : {}),
        })
        .select();

      if (error) throw error;

      setMilestones([...milestones, data[0] as ProjectMilestone]);

      toast({
        title: 'Task added',
        description: 'A new task has been added to the project.',
      });

      return data[0] as ProjectMilestone;
    } catch (error: any) {
      toast({
        title: 'Error saving task',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMilestone = async (
    idOrMilestone: string | ProjectMilestone,
    titleOrUpdates?: string,
    description?: string | null,
    dueDate?: Date | undefined,
    calendarSyncEnabled?: boolean,
    additionalFields?: Partial<ProjectMilestone>
  ) => {
    try {
      // Handle either id string or full milestone object
      let id: string;
      let updates: Partial<ProjectMilestone>;

      if (typeof idOrMilestone === 'string') {
        // Old method signature with separate parameters
        id = idOrMilestone;
        updates = {
          title: titleOrUpdates as string,
          description: description || null,
          due_date: dueDate ? dueDate.toISOString() : null,
          ...additionalFields,
        };

        // Only include calendar fields if explicitly provided
        if (calendarSyncEnabled !== undefined) {
          updates.calendar_sync_enabled = calendarSyncEnabled;
        }

        // Convert start_date to ISO string if it's a Date object
        if (updates.start_date && typeof updates.start_date !== 'string') {
          updates.start_date = (updates.start_date as Date).toISOString();
        }
      } else {
        // New method signature with milestone object
        id = idOrMilestone.id;
        updates = idOrMilestone;

        // Convert Date objects to strings if needed
        if (updates.due_date && typeof updates.due_date !== 'string') {
          updates.due_date = (updates.due_date as Date).toISOString();
        }
        if (updates.start_date && typeof updates.start_date !== 'string') {
          updates.start_date = (updates.start_date as Date).toISOString();
        }
      }

      const { error } = await supabase.from('project_milestones').update(updates).eq('id', id);

      if (error) throw error;

      setMilestones(milestones.map(m => (m.id === id ? { ...m, ...updates } : m)));

      toast({
        title: 'Task updated',
        description: 'The task has been updated successfully.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteMilestone = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        const { error } = await supabase.from('project_milestones').delete().eq('id', id);

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
          variant: 'destructive',
        });
        return false;
      }
    }
    return false;
  };

  const toggleMilestoneComplete = async (id: string, currentStatus: boolean) => {
    try {
      // Update both is_completed and status fields
      const newIsCompleted = !currentStatus;
      const newStatus: MilestoneStatus = newIsCompleted ? 'completed' : 'not_started';

      const { error } = await supabase
        .from('project_milestones')
        .update({
          is_completed: newIsCompleted,
          status: newStatus,
        })
        .eq('id', id);

      if (error) throw error;

      setMilestones(
        milestones.map(m =>
          m.id === id
            ? {
                ...m,
                is_completed: newIsCompleted,
                status: newStatus,
              }
            : m
        )
      );

      return true;
    } catch (error: any) {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
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
    toggleMilestoneComplete,
  };
};
