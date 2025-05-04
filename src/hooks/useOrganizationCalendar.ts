import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalendarAccessLevel, OrganizationCalendar, CalendarAccess } from '@/types/calendar';

export function useOrganizationCalendar() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<OrganizationCalendar | null>(null);
  const [accessList, setAccessList] = useState<CalendarAccess[]>([]);
  const { toast } = useToast();

  // Fetch organization calendar
  const fetchOrganizationCalendar = async () => {
    setLoading(true);
    try {
      // First try to get existing calendar
      const { data, error } = await supabase
        .from('organization_calendar')
        .select('*')
        .order('created_at')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setCalendar(data as OrganizationCalendar | null);

      // If calendar exists, get access list
      if (data) {
        const { data: accessData, error: accessError } = await supabase
          .from('calendar_access')
          .select('*')
          .eq('calendar_id', data.id);

        if (accessError) throw accessError;
        setAccessList(accessData as CalendarAccess[]);
      }
    } catch (error: any) {
      console.error('Error fetching organization calendar:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Create organization calendar
  const createOrganizationCalendar = async (
    name: string = 'Projects Calendar',
    googleCalendarId?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('organization_calendar')
        .insert({
          name,
          google_calendar_id: googleCalendarId || null,
          is_enabled: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCalendar(data as OrganizationCalendar);
      toast({
        title: 'Calendar created',
        description: 'Organization calendar has been created successfully',
      });

      return data as OrganizationCalendar;
    } catch (error: any) {
      console.error('Error creating organization calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to create organization calendar',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update organization calendar
  const updateOrganizationCalendar = async (
    calendarId: string,
    updates: Partial<OrganizationCalendar>
  ) => {
    try {
      const { error } = await supabase
        .from('organization_calendar')
        .update(updates)
        .eq('id', calendarId);

      if (error) throw error;

      setCalendar(prev => (prev ? { ...prev, ...updates } : null));
      toast({
        title: 'Calendar updated',
        description: 'Organization calendar has been updated successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating organization calendar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update organization calendar',
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
        .from('calendar_access')
        .insert({
          calendar_id: calendarId,
          employee_id: employeeId,
          access_level: accessLevel,
        })
        .select()
        .single();

      if (error) throw error;

      setAccessList(prev => [...prev, data as CalendarAccess]);
      toast({
        title: 'Access granted',
        description: 'Calendar access has been granted successfully',
      });

      return data as CalendarAccess;
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
        .from('calendar_access')
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
      const { error } = await supabase.from('calendar_access').delete().eq('id', accessId);

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
    fetchOrganizationCalendar();
  }, []);

  return {
    loading,
    error,
    calendar,
    accessList,
    fetchOrganizationCalendar,
    createOrganizationCalendar,
    updateOrganizationCalendar,
    addCalendarAccess,
    updateCalendarAccess,
    removeCalendarAccess,
  };
}
