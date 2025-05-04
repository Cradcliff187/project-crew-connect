import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectCalendar, ProjectCalendarAccess, CalendarAccessLevel } from '@/types/calendar';

interface UseProjectCalendarProps {
  projectId: string;
}

export function useProjectCalendar({ projectId }: UseProjectCalendarProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<ProjectCalendar | null>(null);
  const [accessList, setAccessList] = useState<ProjectCalendarAccess[]>([]);
  const { toast } = useToast();

  // Fetch project calendar
  const fetchProjectCalendar = async () => {
    setLoading(true);
    try {
      // First try to get existing calendar
      const { data, error } = await supabase
        .from('project_calendars')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      setCalendar(data as ProjectCalendar | null);

      // If calendar exists, get access list
      if (data) {
        const { data: accessData, error: accessError } = await supabase
          .from('project_calendar_access')
          .select('*')
          .eq('project_calendar_id', data.id);

        if (accessError) throw accessError;
        setAccessList(accessData as ProjectCalendarAccess[]);
      }
    } catch (error: any) {
      console.error('Error fetching project calendar:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create a project calendar
  const createProjectCalendar = async (googleCalendarId?: string) => {
    try {
      const { data, error } = await supabase
        .from('project_calendars')
        .insert({
          project_id: projectId,
          google_calendar_id: googleCalendarId || null,
          is_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCalendar(data as ProjectCalendar);
      toast({
        title: 'Calendar created',
        description: 'Project calendar has been created successfully',
      });

      return data as ProjectCalendar;
    } catch (error: any) {
      console.error('Error creating project calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project calendar',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update project calendar
  const updateProjectCalendar = async (calendarId: string, updates: Partial<ProjectCalendar>) => {
    try {
      const { error } = await supabase
        .from('project_calendars')
        .update(updates)
        .eq('id', calendarId);

      if (error) throw error;

      setCalendar(prev => (prev ? { ...prev, ...updates } : null));
      toast({
        title: 'Calendar updated',
        description: 'Project calendar has been updated successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating project calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project calendar',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Add calendar access for an employee
  const addCalendarAccess = async (
    calendarId: string,
    employeeId: string,
    accessLevel: CalendarAccessLevel = 'read'
  ) => {
    try {
      const { data, error } = await supabase
        .from('project_calendar_access')
        .insert({
          project_calendar_id: calendarId,
          employee_id: employeeId,
          access_level: accessLevel,
        })
        .select()
        .single();

      if (error) throw error;

      setAccessList(prev => [...prev, data as ProjectCalendarAccess]);
      toast({
        title: 'Access granted',
        description: 'Calendar access has been granted successfully',
      });

      return data as ProjectCalendarAccess;
    } catch (error: any) {
      console.error('Error adding calendar access:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant calendar access',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update calendar access level
  const updateCalendarAccess = async (accessId: string, accessLevel: CalendarAccessLevel) => {
    try {
      const { error } = await supabase
        .from('project_calendar_access')
        .update({ access_level: accessLevel })
        .eq('id', accessId);

      if (error) throw error;

      setAccessList(prev =>
        prev.map(item => (item.id === accessId ? { ...item, access_level: accessLevel } : item))
      );
      toast({
        title: 'Access updated',
        description: 'Calendar access has been updated successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating calendar access:', error);
      toast({
        title: 'Error',
        description: 'Failed to update calendar access',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Remove calendar access
  const removeCalendarAccess = async (accessId: string) => {
    try {
      const { error } = await supabase.from('project_calendar_access').delete().eq('id', accessId);

      if (error) throw error;

      setAccessList(prev => prev.filter(item => item.id !== accessId));
      toast({
        title: 'Access removed',
        description: 'Calendar access has been removed successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error removing calendar access:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove calendar access',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Load calendar data on initial render
  useEffect(() => {
    if (projectId) {
      fetchProjectCalendar();
    }
  }, [projectId]);

  return {
    loading,
    error,
    calendar,
    accessList,
    fetchProjectCalendar,
    createProjectCalendar,
    updateProjectCalendar,
    addCalendarAccess,
    updateCalendarAccess,
    removeCalendarAccess,
  };
}
