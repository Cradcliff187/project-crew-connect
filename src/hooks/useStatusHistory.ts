import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EntityType } from '@/types/common';

interface StatusHistoryOptions {
  entityId: string;
  entityType: EntityType;
  historyTable?: string;
  entityIdField?: string;
  statusField?: string;
  previousStatusField?: string;
  changedByField?: string;
  changedDateField?: string;
  notesField?: string;
}

// Map entity types to their respective history tables and ID fields
const getEntityTableInfo = (entityType: EntityType) => {
  switch (entityType) {
    case 'CHANGE_ORDER':
      return {
        historyTable: 'change_order_status_history',
        entityIdField: 'change_order_id',
      };
    case 'PROJECT':
      return {
        historyTable: 'project_status_history',
        entityIdField: 'projectid',
      };
    case 'WORK_ORDER':
      return {
        historyTable: 'work_order_status_history',
        entityIdField: 'work_order_id',
      };
    case 'CONTACT':
      return {
        historyTable: 'contact_status_history',
        entityIdField: 'contact_id',
      };
    case 'VENDOR':
      return {
        historyTable: 'vendor_status_history',
        entityIdField: 'vendorid',
      };
    case 'ESTIMATE':
      return {
        historyTable: 'estimate_status_history',
        entityIdField: 'estimateid',
      };
    case 'CUSTOMER':
      return {
        historyTable: 'customer_status_history',
        entityIdField: 'customerid',
      };
    case 'TIME_ENTRY':
      return {
        historyTable: 'time_entry_status_history',
        entityIdField: 'time_entry_id',
      };
    case 'EMPLOYEE':
      return {
        historyTable: 'employee_status_history',
        entityIdField: 'employeeid',
      };
    default:
      return {
        historyTable: 'activitylog',
        entityIdField: 'referenceid',
      };
  }
};

export function useStatusHistory({
  entityId,
  entityType,
  historyTable,
  entityIdField,
  statusField = 'status',
  previousStatusField = 'previous_status',
  changedByField = 'changed_by',
  changedDateField = 'changed_date',
  notesField = 'notes',
}: StatusHistoryOptions) {
  const [loading, setLoading] = useState(false);

  // Use the entity-specific table info if not explicitly provided
  const defaultTableInfo = getEntityTableInfo(entityType);
  const resolvedHistoryTable = historyTable || defaultTableInfo.historyTable;
  const resolvedEntityIdField = entityIdField || defaultTableInfo.entityIdField;

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
      // For all entity types, first attempt to use the specific history table if it exists
      const historyRecord = {
        [resolvedEntityIdField]: entityId,
        [statusField]: newStatus,
        [previousStatusField]: previousStatus,
        [changedDateField]: new Date().toISOString(),
      } as Record<string, any>;

      if (changedBy) {
        historyRecord[changedByField] = changedBy;
      }

      if (notes) {
        historyRecord[notesField] = notes;
      }

      // Try to insert into the specific history table - using type assertion for safety
      try {
        // We need to use type assertion here since we're using dynamic table names
        const { error } = await supabase.from(resolvedHistoryTable as any).insert(historyRecord);

        if (error) {
          // If there's an error (likely table doesn't exist), fall back to activitylog
          throw error;
        }
        return true;
      } catch (error) {
        console.log(`Falling back to activitylog for ${entityType} status history`);
        // Fall back to activitylog
        const { error: activityError } = await supabase.from('activitylog').insert({
          action: 'Status Change',
          moduletype: entityType,
          referenceid: entityId,
          status: newStatus,
          previousstatus: previousStatus,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          useremail: changedBy,
          detailsjson: notes ? JSON.stringify({ notes }) : null,
        });

        if (activityError) throw activityError;
        return true;
      }
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
      // First, try to fetch from the specific history table
      try {
        // Using type assertion for the table name
        const { data, error } = await supabase
          .from(resolvedHistoryTable as any)
          .select('*')
          .eq(resolvedEntityIdField, entityId)
          .order(changedDateField, { ascending: false });

        if (error) throw error;
        return (data as any[]) || [];
      } catch (error) {
        console.log(`Falling back to activitylog for ${entityType} status history`);
        // Fall back to activitylog for all entity types
        const { data: activityData, error: activityError } = await supabase
          .from('activitylog')
          .select('*')
          .eq('referenceid', entityId)
          .eq('moduletype', entityType)
          .order('timestamp', { ascending: false });

        if (activityError) throw activityError;

        // Transform activitylog data to match the expected format
        const formattedData =
          activityData?.map(item => ({
            id: item.logid,
            [resolvedEntityIdField]: item.referenceid,
            [statusField]: item.status,
            [previousStatusField]: item.previousstatus,
            [changedDateField]: item.timestamp,
            [changedByField]: item.useremail,
            [notesField]: item.action,
            created_at: item.created_at,
            updated_at: item.updated_at,
          })) || [];

        return formattedData;
      }
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
    fetchStatusHistory,
  };
}
