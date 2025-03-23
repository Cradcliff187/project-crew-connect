import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import { TimeEntry } from '@/types/timeTracking';

const TimeTracking = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { data: timeEntries, isLoading } = useQuery({
    queryKey: ['timeEntries', selectedDate],
    queryFn: async () => {
      let query = supabase
        .from('time_entries')
        .select('*');
      
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split('T')[0];
        query = query.eq('date_worked', dateString);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as TimeEntry[];
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching time entries:', error);
      }
    }
  });
  
  return (
    <PageTransition>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Time Tracking</h1>
        
        {isLoading ? (
          <p>Loading time entries...</p>
        ) : timeEntries && timeEntries.length > 0 ? (
          <div>
            <p>Found {timeEntries.length} time entries</p>
            {/* Render time entries here */}
          </div>
        ) : (
          <p>No time entries found</p>
        )}
      </div>
    </PageTransition>
  );
};

export default TimeTracking;
