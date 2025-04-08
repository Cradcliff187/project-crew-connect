import React from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { TimeEntry, TimeOfDay } from '@/types/timeTracking';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Clock, 
  MapPin, 
  Trash2, 
  Edit, 
  FileSpreadsheet,
  Calendar,
  UserRound
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import TimeEntryDeleteDialog from './TimeEntryDeleteDialog';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import { useTimeEntryOperations } from './hooks/useTimeEntryOperations';
import { formatTime, getTimeOfDay, formatHoursToDuration } from './utils/timeUtils';

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
    .sort((a, b) => a[0].localeCompare(b[0]))); // Sort chronologically (ascending)
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

const formatDayHeader = (dateStr: string): string => {
  const date = parseISO(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
    return `Today, ${format(date, 'EEEE, MMMM d')}`;
  } else if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
    return `Yesterday, ${format(date, 'EEEE, MMMM d')}`;
  } else {
    return format(date, 'EEEE, MMMM d');
  }
};

const calculateDailyTotal = (entries: TimeEntry[]): number => {
  return entries.reduce((sum, entry) => sum + entry.hours_worked, 0);
};

export interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading?: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ 
  entries, 
  isLoading = false, 
  onEntryChange,
  isMobile = false
}) => {
  const {
    isDeleting,
    entryToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    startDelete,
    confirmDelete,
    isSaving,
    entryToEdit,
    showEditDialog,
    setShowEditDialog,
    startEdit,
    saveEdit
  } = useTimeEntryOperations(onEntryChange);

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

  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No time entries for this week. Add one to get started.
      </div>
    );
  }

  const groupedEntries = groupEntriesByDate(entries);

  return (
    <div className="space-y-6">
      {Array.from(groupedEntries.entries()).map(([date, dayEntries]) => {
        const dailyTotal = calculateDailyTotal(dayEntries);
        
        return (
          <div key={date} className="space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-[#0485ea]" />
                <h3 className="text-sm font-medium">{formatDayHeader(date)}</h3>
              </div>
              <span className="text-sm font-medium text-[#0485ea]">
                {dailyTotal.toFixed(1)} hours
              </span>
            </div>
            
            <div className="space-y-2 pl-0 lg:pl-6">
              {dayEntries.map((entry) => {
                const startHour = parseInt(entry.start_time?.split(':')[0] || '0');
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
                            
                            {entry.employee_name && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <UserRound className="h-3 w-3 mr-1" />
                                {entry.employee_name}
                              </div>
                            )}
                            
                            {entry.entity_location && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {entry.entity_location}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-[#0485ea]">
                              {formatHoursToDuration(entry.hours_worked)}
                            </span>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onSelect={() => startEdit(entry)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {entry.has_receipts && (
                                  <DropdownMenuItem>
                                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                                    View Receipts
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  onSelect={() => startDelete(entry)}
                                  className="text-destructive cursor-pointer"
                                >
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
          </div>
        );
      })}
      
      <TimeEntryDeleteDialog
        timeEntry={entryToDelete}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
      
      <TimeEntryEditDialog
        timeEntry={entryToEdit}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={saveEdit}
        isSaving={isSaving}
      />
    </div>
  );
};

export default TimeEntryList;
