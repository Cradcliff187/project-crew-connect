
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';
import { format } from 'date-fns';

// Default date range - current week
const getDefaultDateRange = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Saturday
  
  return {
    startDate: startOfWeek,
    endDate: endOfWeek
  };
};

interface DateRange {
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
        .order('date_worked', { ascending: false });
      
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
  
  // Fetch entries when date range changes
  useEffect(() => {
    fetchTimeEntries();
  }, [fetchTimeEntries]);
  
  // Helper to enhance time entry with entity and receipt data
  const enhanceTimeEntry = async (entry: TimeEntry): Promise<TimeEntry> => {
    try {
      let entityName = '';
      let entityLocation = '';
      
      // Fetch entity details based on type
      if (entry.entity_type === 'work_order') {
        const { data } = await supabase
          .from('maintenance_work_orders')
          .select('title, address, city, state')
          .eq('work_order_id', entry.entity_id)
          .single();
        
        if (data) {
          entityName = data.title;
          entityLocation = data.address ? 
            `${data.address}, ${data.city || ''} ${data.state || ''}`.trim() : 
            '';
        }
      } else if (entry.entity_type === 'project') {
        const { data } = await supabase
          .from('projects')
          .select('projectname, address, city, state')
          .eq('projectid', entry.entity_id)
          .single();
        
        if (data) {
          entityName = data.projectname || entry.entity_id;
          entityLocation = data.address ? 
            `${data.address}, ${data.city || ''} ${data.state || ''}`.trim() : 
            '';
        }
      }
      
      // Fetch documents/receipts if any
      let documents = [];
      if (entry.has_receipts) {
        const { data: receipts } = await supabase
          .from('time_entry_receipts')
          .select('*')
          .eq('time_entry_id', entry.id);
        
        if (receipts && receipts.length > 0) {
          // Add URLs for receipts
          documents = await Promise.all(receipts.map(async (receipt) => {
            const { data } = await supabase
              .storage
              .from('receipts')
              .createSignedUrl(receipt.storage_path, 60 * 60); // 1 hour expiry
            
            return {
              ...receipt,
              url: data?.signedUrl
            };
          }));
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
    refreshEntries: fetchTimeEntries
  };
};
