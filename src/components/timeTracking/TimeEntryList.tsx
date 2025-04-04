
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntry, TimeOfDay } from '@/types/timeTracking';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Clock, 
  MapPin, 
  Trash2, 
  Edit, 
  FileSpreadsheet 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

// Define the props interface
export interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading?: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

const formatDuration = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h ${minutes}m`;
  }
};

const groupEntriesByDate = (entries: TimeEntry[]) => {
  const grouped = new Map<string, TimeEntry[]>();

  entries.forEach(entry => {
    const dateKey = entry.date_worked;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)?.push(entry);
  });

  grouped.forEach((entriesForDate, date) => {
    grouped.set(date, [...entriesForDate].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    ));
  });

  return new Map([...grouped.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])));
};

const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const getTimeOfDayColor = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case 'morning': return 'bg-blue-100 text-blue-800';
    case 'afternoon': return 'bg-amber-100 text-amber-800';
    case 'evening': return 'bg-purple-100 text-purple-800';
    case 'night': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Main component export
export const TimeEntryList: React.FC<TimeEntryListProps> = ({ 
  entries, 
  isLoading = false, 
  onEntryChange,
  isMobile = false
}) => {
  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-2/3 mb-2" />
                <div className="flex items-center mt-2">
                  <Skeleton className="h-4 w-24 mr-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show empty state if no entries
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No time entries for this day. Add one to get started.
      </div>
    );
  }

  // Group entries by date for better organization
  const groupedEntries = groupEntriesByDate(entries);
  
  return (
    <div className="space-y-4">
      {Array.from(groupedEntries.entries()).map(([date, dateEntries]) => (
        <div key={date} className="space-y-2">
          {dateEntries.map((entry) => {
            // Get time of day for visual indication
            const startHour = parseInt(entry.start_time.split(':')[0]);
            const timeOfDay = getTimeOfDay(startHour);
            const timeOfDayColor = getTimeOfDayColor(timeOfDay);
            
            return (
              <Card key={entry.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {entry.entity_name || `${entry.entity_type.charAt(0).toUpperCase() + entry.entity_type.slice(1)} ${entry.entity_id.slice(0, 8)}`}
                          </span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${timeOfDayColor}`}>
                            {timeOfDay}
                          </span>
                        </div>
                        
                        {entry.entity_location && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {entry.entity_location}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-[#0485ea]">
                          {formatDuration(entry.hours_worked)}
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {entry.has_receipts && (
                              <DropdownMenuItem>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                View Receipts
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                      </span>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-2 text-sm border-t pt-2">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TimeEntryList;
