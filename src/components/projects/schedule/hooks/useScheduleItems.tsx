import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScheduleItem } from '../ScheduleItemFormDialog'; // Import type from form
import { useToast } from '@/hooks/use-toast';

export const useScheduleItems = (projectId: string) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchScheduleItems = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*') // Select all columns for now
        .eq('project_id', projectId)
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      setScheduleItems(data || []);
    } catch (err: any) {
      console.error('Error fetching schedule items:', err);
      setError(err.message || 'Failed to fetch schedule items');
      toast({
        title: 'Error',
        description: err.message || 'Could not load schedule items.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchScheduleItems();
  }, [fetchScheduleItems]);

  const addScheduleItem = async (itemData: Partial<ScheduleItem>): Promise<ScheduleItem | null> => {
    setLoading(true);
    try {
      // Ensure project_id is included
      const dataToInsert = { ...itemData, project_id: projectId };

      const { data, error } = await supabase
        .from('schedule_items')
        .insert(dataToInsert)
        .select()
        .single(); // Assuming insert returns the created row

      if (error) throw error;

      if (data) {
        setScheduleItems(prev => [...prev, data]);
        toast({ title: 'Success', description: 'Schedule item added.' });
        return data;
      }
      return null;
    } catch (err: any) {
      console.error('Error adding schedule item:', err);
      setError(err.message || 'Failed to add schedule item');
      toast({
        title: 'Error',
        description: err.message || 'Could not add item.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleItem = async (
    itemId: string,
    updates: Partial<ScheduleItem>
  ): Promise<ScheduleItem | null> => {
    setLoading(true);
    try {
      // Ensure updated_at is set automatically by trigger, remove from manual updates if present
      const { updated_at, created_at, ...restUpdates } = updates;

      const { data, error } = await supabase
        .from('schedule_items')
        .update(restUpdates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setScheduleItems(prev =>
          prev.map(item => (item.id === itemId ? { ...item, ...data } : item))
        );
        toast({ title: 'Success', description: 'Schedule item updated.' });
        return data;
      }
      return null;
    } catch (err: any) {
      console.error('Error updating schedule item:', err);
      setError(err.message || 'Failed to update schedule item');
      toast({
        title: 'Error',
        description: err.message || 'Could not update item.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduleItem = async (itemId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.from('schedule_items').delete().eq('id', itemId);

      if (error) throw error;

      setScheduleItems(prev => prev.filter(item => item.id !== itemId));
      toast({ title: 'Success', description: 'Schedule item deleted.' });
      return true;
    } catch (err: any) {
      console.error('Error deleting schedule item:', err);
      setError(err.message || 'Failed to delete schedule item');
      toast({
        title: 'Error',
        description: err.message || 'Could not delete item.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    scheduleItems,
    loading,
    error,
    fetchScheduleItems,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
  };
};
