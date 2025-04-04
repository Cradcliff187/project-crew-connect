
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Briefcase, Building, Clock, ArrowRight, Receipt, ExternalLink as ExternalLinkIcon, Download as DownloadIcon } from 'lucide-react';
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
import { DotsVerticalIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { formatDuration } from '@/components/estimates/utils/estimateCalculations';

interface TimeEntryListProps {
  entries: TimeEntry[];
  onEdit?: (entry: TimeEntry) => void;
  onDelete?: (entry: TimeEntry) => void;
  onViewReceipt?: (url: string) => void;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// Group entries by date
const groupEntriesByDate = (entries: TimeEntry[]) => {
  const grouped = new Map<string, TimeEntry[]>();

  entries.forEach(entry => {
    const dateKey = entry.date_worked;
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)?.push(entry);
  });

  // Sort entries within each day
  grouped.forEach((entriesForDate, date) => {
    grouped.set(date, [...entriesForDate].sort((a, b) => 
      a.start_time.localeCompare(b.start_time)
    ));
  });

  // Sort dates in descending order (newest first)
  return new Map([...grouped.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])));
};

// Determine time of day based on hour
const getTimeOfDay = (hour: number): TimeOfDay => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Get color based on time of day
const getTimeOfDayColor = (timeOfDay: TimeOfDay): string => {
  switch (timeOfDay) {
    case 'morning': return 'bg-blue-100 text-blue-800';
    case 'afternoon': return 'bg-amber-100 text-amber-800';
    case 'evening': return 'bg-purple-100 text-purple-800';
    case 'night': return 'bg-indigo-100 text-indigo-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Format start time with AM/PM
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
  onViewReceipt
}) => {
  const [showReceiptDialog, setShowReceiptDialog] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Group entries by date
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
                // Get the start hour for time of day styling
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
                                <DotsVerticalIcon className="h-4 w-4" />
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
                          <div className="mt-3 text-sm text-muted-foreground">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                      
                      {entry.has_receipts && entry.documents && entry.documents.length > 0 && (
                        <div className="border-t pt-2 pb-3 px-4">
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Receipt className="h-3 w-3 mr-1" />
                            Receipt{entry.documents.length > 1 ? 's' : ''}
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {entry.documents.map((doc: any) => (
                              <div 
                                key={doc.id} 
                                className="rounded-md border px-3 py-1 text-xs flex items-center gap-1"
                              >
                                <span className="truncate max-w-[100px]">
                                  {doc.file_name}
                                </span>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => handleViewReceipt(doc.url || '')}
                                  >
                                    <ExternalLinkIcon className="h-3 w-3" />
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    asChild
                                  >
                                    <a href={doc.url} download target="_blank" rel="noopener noreferrer">
                                      <DownloadIcon className="h-3 w-3" />
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {entry.total_cost && (
                            <div className="mt-2 text-xs flex justify-end">
                              <span className="font-medium">
                                Expense: ${entry.total_cost.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Receipt Viewer Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-[500px] p-0" : "w-[500px] p-0"}>
          <DialogTitle className="px-4 py-3 border-b">Receipt</DialogTitle>
          <div className="overflow-auto max-h-[80vh]">
            {selectedReceipt && (
              <div className="flex flex-col items-center">
                <img 
                  src={selectedReceipt} 
                  alt="Receipt" 
                  className="w-full object-contain"
                />
                <div className="py-3 px-4 w-full flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowReceiptDialog(false)}
                  >
                    Close
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={selectedReceipt} download target="_blank" rel="noopener noreferrer">
                      <DownloadIcon className="h-3.5 w-3.5 mr-1.5" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeEntryList;
