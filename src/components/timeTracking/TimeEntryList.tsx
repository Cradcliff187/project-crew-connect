
import React from 'react';
import { format } from 'date-fns';
import { TimeEntry } from '@/types/timeTracking';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Receipt, CalendarIcon } from 'lucide-react';

interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onEntryChange?: () => void;
  isMobile?: boolean;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  entries,
  isLoading,
  onEntryChange,
  isMobile = false
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 border rounded-md">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No time entries found for this period.</p>
        <p className="text-sm">Create a new entry to get started.</p>
      </div>
    );
  }

  // Group entries by date
  const entriesByDate = entries.reduce<Record<string, TimeEntry[]>>((acc, entry) => {
    const dateKey = entry.date_worked;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const getEntityName = (entry: TimeEntry): string => {
    return entry.entity_name || `${entry.entity_type.charAt(0).toUpperCase() + entry.entity_type.slice(1)} #${entry.entity_id.slice(-5)}`;
  };

  return (
    <div className="space-y-4">
      {Object.entries(entriesByDate).map(([date, dayEntries]) => (
        <div key={date} className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <CalendarIcon className="h-4 w-4 text-[#0485ea]" />
            <h3 className="font-medium text-sm">{format(new Date(date), 'EEEE, MMM d')}</h3>
          </div>
          <div className="space-y-2">
            {dayEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                {isMobile ? (
                  // Mobile optimized compact view
                  <div className="text-sm">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="font-medium truncate mr-2">
                        {getEntityName(entry)}
                      </div>
                      <div className="flex items-center whitespace-nowrap text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        <Clock className="h-3 w-3 mr-1 text-[#0485ea]" />
                        {entry.hours_worked} hrs
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        {entry.employee_name || "Unknown"}
                        {entry.has_receipts && (
                          <Receipt className="h-3 w-3 ml-1 text-[#0485ea]" />
                        )}
                      </div>
                      <div>
                        {entry.start_time} - {entry.end_time}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Desktop view with more details
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium">
                        {getEntityName(entry)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1 text-[#0485ea]" />
                        {entry.hours_worked} hours
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        {entry.employee_name || "Unknown"}
                        {entry.has_receipts && (
                          <Receipt className="h-4 w-4 ml-1 text-[#0485ea]" />
                        )}
                      </div>
                      <div>
                        {entry.start_time} - {entry.end_time}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
