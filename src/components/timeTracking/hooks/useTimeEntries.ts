
import { useState, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';

// Default date range - current week starting from Monday
const getDefaultDateRange = () => {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // 1 = Monday
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
  
  return {
    startDate: startOfCurrentWeek,
    endDate: endOfCurrentWeek
  };
};

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export const useTimeEntries = (initialDateRange?: DateRange) => {
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange || getDefaultDateRange());
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTimeEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDateStr = format(dateRange.startDate, 'yyyy-MM-dd');
      const endDateStr = format(dateRange.endDate, 'yyyy-MM-dd');
      
      // Fetch time entries within date range
      const { data: timeEntries, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .gte('date_worked', startDateStr)
        .lte('date_worked', endDateStr)
        .order('date_worked', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      // Convert raw entries to TimeEntry type with additional data
      const enhancedEntriesPromises = (timeEntries || []).map(async (entry) => {
        // Type assertion to handle string vs enum type mismatch
        const typedEntry = {
          ...entry,
          entity_type: entry.entity_type as "work_order" | "project"
        };
        
        return await enhanceTimeEntry(typedEntry);
      });
      
      const enhancedEntries = await Promise.all(enhancedEntriesPromises);
      setEntries(enhancedEntries);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);
  
  // Navigate to next week
  const goToNextWeek = () => {
    setDateRange(current => ({
      startDate: addWeeks(current.startDate, 1),
      endDate: addWeeks(current.endDate, 1)
    }));
  };

  // Navigate to previous week
  const goToPrevWeek = () => {
    setDateRange(current => ({
      startDate: subWeeks(current.startDate, 1),
      endDate: subWeeks(current.endDate, 1)
    }));
  };

  // Go to current week
  const goToCurrentWeek = () => {
    setDateRange(getDefaultDateRange());
  };

  // Helper to enhance time entry with entity and receipt data
  const enhanceTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
    try {
      let entityName = '';
      let entityLocation = '';
      
      // Fetch entity details based on type
      if (entry.entity_type === 'work_order') {
        const { data } = await supabase
          .from('maintenance_work_orders')
          .select('title, description')
          .eq('work_order_id', entry.entity_id)
          .single();
        
        if (data) {
          entityName = data.title || '';
          // We don't have location data in this table, so leave it empty
          entityLocation = '';
        }
      } else if (entry.entity_type === 'project') {
        const { data } = await supabase
          .from('projects')
          .select('projectname, sitelocationaddress, sitelocationcity, sitelocationstate')
          .eq('projectid', entry.entity_id)
          .single();
        
        if (data) {
          entityName = data.projectname || entry.entity_id;
          entityLocation = [
            data.sitelocationaddress,
            data.sitelocationcity,
            data.sitelocationstate
          ].filter(Boolean).join(', ');
        }
      }
      
      // Fetch documents/receipts if any
      let documents = [];
      if (entry.has_receipts) {
        // Use document links instead of nonexistent receipts table
        const { data: documentLinks } = await supabase
          .from('time_entry_document_links')
          .select('document_id')
          .eq('time_entry_id', entry.id);
        
        if (documentLinks && documentLinks.length > 0) {
          const documentIds = documentLinks.map(link => link.document_id);
          const { data: docs } = await supabase
            .from('documents')
            .select('*')
            .in('document_id', documentIds);
            
          if (docs) {
            // Add URLs for documents
            documents = await Promise.all(docs.map(async (doc) => {
              const { data } = await supabase
                .storage
                .from('construction_documents')
                .createSignedUrl(doc.storage_path, 60 * 60); // 1 hour expiry
              
              return {
                ...doc,
                url: data?.signedUrl
              };
            }));
          }
        }
      }
      
      // Return enhanced entry
      return {
        ...entry,
        entity_name: entityName,
        entity_location: entityLocation,
        documents: documents
      };
    } catch (error) {
      console.error('Error enhancing time entry:', error);
      return entry;
    }
  };
  
  return {
    entries,
    loading,
    error,
    dateRange,
    setDateRange,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    refreshEntries: fetchTimeEntries
  };
};
