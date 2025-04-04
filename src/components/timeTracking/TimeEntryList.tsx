import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Briefcase, Building, Clock, ArrowRight, Receipt, ExternalLink as ExternalLinkIcon, Download as DownloadIcon, MoreVertical } from 'lucide-react';
import { TimeEntry } from '@/types/timeTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';

interface TimeEntryListProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entry: TimeEntry) => void;
  onViewReceipt?: (url: string) => void;
  isMobile?: boolean;
  onEntryChange?: () => void;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

const formatDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) {
    return `${wholeHours} hr${wholeHours !== 1 ? 's' : ''}`;
  }
  return `${wholeHours}h ${minutes}m`;
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

const TimeEntryList: React.FC<TimeEntryListProps> = ({ 
  entries,
  onEdit,
  onDelete,
  onViewReceipt,
  isMobile = false
}) => {
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  
  const groupedEntries = groupEntriesByDate(entries);
  
  const handleViewReceipt = (url: string) => {
    setSelectedReceipt(url);
    setShowReceiptDialog(true);
    
    if (onViewReceipt) {
      onViewReceipt(url);
    }
  };
  
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <h3 className="font-medium text-lg">No time entries</h3>
        <p className="text-muted-foreground mt-1">
          There are no time entries for this period
        </p>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {Array.from(groupedEntries.entries()).map(([date, entriesForDate]) => (
          <div key={date} className="space-y-2">
            <h3 className="font-medium text-sm text-muted-foreground sticky top-0 bg-background py-1">
              {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-3">
              {entriesForDate.map(entry => {
                const startHour = parseInt(entry.start_time.split(':')[0], 10);
                const timeOfDay = getTimeOfDay(startHour);
                const timeOfDayColor = getTimeOfDayColor(timeOfDay);
                
                return (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {entry.entity_type === 'work_order' ? (
                              <Briefcase className="h-4 w-4 text-[#0485ea] mr-2 shrink-0" />
                            ) : (
                              <Building className="h-4 w-4 text-[#0485ea] mr-2 shrink-0" />
                            )}
                            <div>
                              <h4 className="font-medium">{entry.entity_name}</h4>
                              {entry.entity_location && (
                                <p className="text-xs text-muted-foreground">
                                  {entry.entity_location}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(entry)}>
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem 
                                  onClick={() => onDelete(entry)}
                                  className="text-red-600"
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={timeOfDayColor}>
                              {formatTime(entry.start_time)}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <Badge className={timeOfDayColor}>
                              {formatTime(entry.end_time)}
                            </Badge>
                          </div>
                          
                          <Badge variant="outline" className="ml-2">
                            {entry.hours_worked} hrs
                          </Badge>
                        </div>
                        
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {entry.notes}
                          </p>
                        )}
                        
                        {entry.documents && entry.documents.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center text-xs text-muted-foreground mb-2">
                              <Receipt className="h-3 w-3 mr-1" />
                              <span>Receipts</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {entry.documents.map((doc, i) => (
                                <Button 
                                  key={i}
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() => doc.url && handleViewReceipt(doc.url)}
                                >
                                  <ExternalLinkIcon className="h-3 w-3 mr-1" />
                                  View {i + 1}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Receipt Document</DialogTitle>
          {selectedReceipt && (
            <div className="mt-2">
              <div className="flex justify-end mb-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(selectedReceipt, '_blank')}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="border rounded-md overflow-hidden">
                {selectedReceipt.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={selectedReceipt} 
                    className="w-full h-[70vh]"
                    title="Receipt PDF" 
                  />
                ) : (
                  <img 
                    src={selectedReceipt} 
                    className="max-h-[70vh] mx-auto" 
                    alt="Receipt" 
                  />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeEntryList;
