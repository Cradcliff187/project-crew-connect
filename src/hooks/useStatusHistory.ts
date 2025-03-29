
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatusHistoryOptions {
  entityId: string;
  entityType: 'PROJECT' | 'WORK_ORDER' | 'CHANGE_ORDER' | 'CONTACT';
  historyTable?: string;
  entityIdField?: string;
  statusField?: string;
  previousStatusField?: string;
  changedByField?: string;
  changedDateField?: string;
  notesField?: string;
}

export function useStatusHistory({
  entityId,
  entityType,
  historyTable = 'change_order_status_history',
  entityIdField = 'change_order_id',
  statusField = 'status',
  previousStatusField = 'previous_status',
  changedByField = 'changed_by',
  changedDateField = 'changed_date',
  notesField = 'notes'
}: StatusHistoryOptions) {
  const [loading, setLoading] = useState(false);
  
  /**
   * Records a status change in the history table
   */
  const recordStatusChange = async (
    newStatus: string, 
    previousStatus: string,
    changedBy?: string,
    notes?: string
  ) => {
    setLoading(true);
    try {
      // Only change orders have status history for now, but this can be expanded
      if (entityType !== 'CHANGE_ORDER') return true;
      
      const historyRecord = {
        [entityIdField]: entityId,
        [statusField]: newStatus,
        [previousStatusField]: previousStatus,
        [changedDateField]: new Date().toISOString()
      } as Record<string, any>;
      
      if (changedBy) {
        historyRecord[changedByField] = changedBy;
      }
      
      if (notes) {
        historyRecord[notesField] = notes;
      }
      
      const { error } = await supabase
        .from(historyTable)
        .insert(historyRecord);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error recording status history:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetches the status history for an entity
   */
  const fetchStatusHistory = async () => {
    setLoading(true);
    try {
      // Only change orders have status history for now
      if (entityType !== 'CHANGE_ORDER') return [];
      
      const { data, error } = await supabase
        .from(historyTable)
        .select('*')
        .eq(entityIdField, entityId)
        .order(changedDateField, { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching status history:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    recordStatusChange,
    fetchStatusHistory
  };
}
