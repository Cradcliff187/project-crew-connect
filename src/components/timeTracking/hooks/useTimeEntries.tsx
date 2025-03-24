
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';

export function useTimeEntries(selectedDate: Date) {
  // Function to fetch time entries
  const fetchTimeEntries = async () => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // First fetch the time entries
    const { data: timeEntries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('date_worked', dateString)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // For each time entry, fetch its receipts through the junction table
    const enhancedData = await Promise.all((timeEntries || []).map(async (entry) => {
      let entityName = "Unknown";
      let entityLocation = "";
      
      if (entry.entity_type === 'project') {
        const { data: projectData } = await supabase
          .from('projects')
          .select('projectname, sitelocationaddress, sitelocationcity, sitelocationstate')
          .eq('projectid', entry.entity_id)
          .single();
          
        if (projectData) {
          entityName = projectData.projectname;
          entityLocation = [
            projectData.sitelocationaddress,
            projectData.sitelocationcity,
            projectData.sitelocationstate
          ].filter(Boolean).join(', ');
        }
      } else if (entry.entity_type === 'work_order') {
        const { data: workOrderData } = await supabase
          .from('maintenance_work_orders')
          .select('title, description')
          .eq('work_order_id', entry.entity_id)
          .single();
          
        if (workOrderData) {
          entityName = workOrderData.title;
        }
      }
      
      // Fetch employee name if available
      let employeeName = "Unassigned";
      if (entry.employee_id) {
        const { data: employeeData } = await supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('employee_id', entry.employee_id)
          .single();
          
        if (employeeData) {
          employeeName = `${employeeData.first_name} ${employeeData.last_name}`;
        }
      }
      
      // Fetch the receipt documents through the junction table
      let documents = [];
      if (entry.has_receipts) {
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
            
          documents = docs || [];
        }
      }
      
      return {
        ...entry,
        entity_name: entityName,
        entity_location: entityLocation,
        employee_name: employeeName,
        documents: documents
      };
    }));
    
    return enhancedData as TimeEntry[];
  };
  
  // Use React Query to fetch and cache the data
  const { data: timeEntries, isLoading, refetch } = useQuery({
    queryKey: ['timeEntries', selectedDate.toISOString()],
    queryFn: fetchTimeEntries,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching time entries:', error);
      }
    }
  });
  
  return {
    timeEntries: timeEntries || [],
    isLoading,
    refetch
  };
}
