import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLogOptions {
  entityId?: string;
  entityType?: string;
  limit?: number;
  includeAllTypes?: boolean;
}

export function useActivityLog({
  entityId,
  entityType,
  limit = 20,
  includeAllTypes = false,
}: ActivityLogOptions = {}) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('activitylog')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      // If entity ID is provided, filter by reference ID
      if (entityId) {
        query = query.eq('referenceid', entityId);
      }

      // If entity type is provided, filter by module type
      if (entityType && !includeAllTypes) {
        query = query.eq('moduletype', entityType);
      }

      const { data, error: apiError } = await query;

      if (apiError) throw apiError;

      setActivities(data || []);
    } catch (err: any) {
      console.error('Error fetching activity log:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [entityId, entityType, limit]);

  return {
    activities,
    loading,
    error,
    refresh: fetchActivities,
  };
}
