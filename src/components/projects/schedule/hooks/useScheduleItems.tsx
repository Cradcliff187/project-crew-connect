import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScheduleItem, RecurrencePattern, ScheduleObjectType } from '@/types/schedule'; // Import from our types file
import { useToast } from '@/hooks/use-toast';
import { ensureSession } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// API base URL for calling backend endpoints
const API_BASE_URL = 'http://localhost:3000';

export const useScheduleItems = (projectId: string) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchScheduleItems = useCallback(async () => {
    if (!projectId) return;

    const currentSession = await ensureSession();
    if (!currentSession) {
      toast({
        title: 'Authentication Error',
        description: 'Session not found. Redirecting to login.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use type assertion to work around type issues
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .select('*') // Select all columns for now
        .eq('project_id', projectId)
        .order('start_datetime', { ascending: true });

      if (error) throw error;

      // Transform the data to match the ScheduleItem interface
      const transformedItems: ScheduleItem[] = (data || []).map((item: any) => ({
        id: item.id,
        project_id: item.project_id,
        title: item.title,
        description: item.description || '',
        start_datetime: item.start_datetime,
        end_datetime: item.end_datetime,
        is_all_day: item.is_all_day || false,
        assignee_type: item.assignee_type,
        assignee_id: item.assignee_id,
        calendar_integration_enabled: item.calendar_integration_enabled || false,
        google_event_id: item.google_event_id,
        send_invite: item.send_invite || false,
        invite_status: item.invite_status,
        is_completed: item.is_completed || false,
        recurrence: item.recurrence,
        object_type: item.object_type,
        last_sync_error: item.last_sync_error,
      }));

      setScheduleItems(transformedItems);
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
  }, [projectId, toast, navigate]);

  useEffect(() => {
    fetchScheduleItems();
  }, [fetchScheduleItems]);

  // New function to sync a schedule item with Google Calendar
  const syncWithCalendar = async (itemId: string): Promise<boolean> => {
    try {
      console.log(`Syncing schedule item ${itemId} with Google Calendar`);
      const response = await fetch(`${API_BASE_URL}/api/schedule-items/${itemId}/sync-calendar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for auth
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync with calendar');
      }

      console.log('Calendar sync result:', data);
      return true;
    } catch (err: any) {
      console.error('Error syncing with calendar:', err);
      toast({
        title: 'Calendar Sync Issue',
        description: err.message || 'Could not sync with Google Calendar.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const addScheduleItem = async (itemData: Partial<ScheduleItem>): Promise<ScheduleItem | null> => {
    const currentSession = await ensureSession();
    if (!currentSession) {
      toast({
        title: 'Authentication Error',
        description: 'Cannot add item. Session not found. Redirecting to login.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
      return null;
    }

    setLoading(true);
    try {
      // Ensure project_id is included
      const dataToInsert = { ...itemData, project_id: projectId };

      // Use type assertion to work around type issues
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .insert(dataToInsert)
        .select()
        .single(); // Assuming insert returns the created row

      if (error) throw error;

      if (data) {
        // Transform the returned data to match ScheduleItem interface
        const newItem: ScheduleItem = {
          id: data.id,
          project_id: data.project_id,
          title: data.title,
          description: data.description || '',
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          is_all_day: data.is_all_day || false,
          assignee_type: data.assignee_type,
          assignee_id: data.assignee_id,
          calendar_integration_enabled: data.calendar_integration_enabled || false,
          google_event_id: data.google_event_id,
          send_invite: data.send_invite || false,
          invite_status: data.invite_status,
          is_completed: data.is_completed || false,
          recurrence: data.recurrence,
          object_type: data.object_type,
          last_sync_error: data.last_sync_error,
        };

        setScheduleItems(prev => [...prev, newItem]);
        toast({ title: 'Success', description: 'Schedule item added.' });

        // If calendar integration is enabled, sync with Google Calendar
        if (newItem.calendar_integration_enabled && newItem.send_invite) {
          await syncWithCalendar(newItem.id);
        }

        return newItem;
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
    const currentSession = await ensureSession();
    if (!currentSession) {
      toast({
        title: 'Authentication Error',
        description: 'Cannot update item. Session not found. Redirecting to login.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
      return null;
    }

    setLoading(true);
    try {
      // Ensure updated_at is set automatically by trigger, remove from manual updates if present
      const { updated_at, created_at, ...restUpdates } = updates;

      // Use type assertion to work around type issues
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .update(restUpdates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Transform the returned data to match ScheduleItem interface
        const updatedItem: ScheduleItem = {
          id: data.id,
          project_id: data.project_id,
          title: data.title,
          description: data.description || '',
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          is_all_day: data.is_all_day || false,
          assignee_type: data.assignee_type,
          assignee_id: data.assignee_id,
          calendar_integration_enabled: data.calendar_integration_enabled || false,
          google_event_id: data.google_event_id,
          send_invite: data.send_invite || false,
          invite_status: data.invite_status,
          is_completed: data.is_completed || false,
          recurrence: data.recurrence,
          object_type: data.object_type,
          last_sync_error: data.last_sync_error,
        };

        setScheduleItems(prev => prev.map(item => (item.id === itemId ? updatedItem : item)));
        toast({ title: 'Success', description: 'Schedule item updated.' });

        // If calendar integration is enabled, sync with Google Calendar
        if (updatedItem.calendar_integration_enabled && updatedItem.send_invite) {
          await syncWithCalendar(updatedItem.id);
        }

        return updatedItem;
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
    const currentSession = await ensureSession();
    if (!currentSession) {
      toast({
        title: 'Authentication Error',
        description: 'Cannot delete item. Session not found. Redirecting to login.',
        variant: 'destructive',
      });
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
      return false;
    }

    setLoading(true);
    try {
      // Use type assertion to work around type issues
      const { error } = await (supabase as any).from('schedule_items').delete().eq('id', itemId);

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
    syncWithCalendar, // Export the sync function
  };
};
