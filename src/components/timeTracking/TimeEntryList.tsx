
import React, { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { formatTimeRange } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Clock, MapPin, User, FileText, MoreVertical, Trash2, ExternalLink } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import TimeEntryReceipts from './TimeEntryReceipts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ 
  timeEntries, 
  isLoading, 
  onEntryChange,
  isMobile = false
}) => {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleDelete = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) {
      return;
    }
    
    setDeletingEntryId(entryId);
    
    try {
      // First delete any document links
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('time_entry_id', entryId);
        
      if (linkError) {
        console.error('Error deleting document links:', linkError);
      }
      
      // Then delete the time entry
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been removed successfully.'
      });
      
      onEntryChange();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the time entry. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingEntryId(null);
    }
  };
  
  const openReceiptsDialog = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowReceiptsDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
      </div>
    );
  }
  
  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
        <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-medium text-muted-foreground">No time entries</h3>
        <p className="text-sm text-muted-foreground">
          You haven't logged any time for this day yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {timeEntries.map((entry) => (
        <Card key={entry.id} className="overflow-hidden shadow-sm border-l-4 border-l-[#0485ea]">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-base">
                  {entry.entity_name || "Unknown"} 
                  <span className="ml-1 text-xs capitalize px-2 py-0.5 bg-gray-100 rounded-full">
                    {entry.entity_type.replace('_', ' ')}
                  </span>
                </h3>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {formatTimeRange(entry.start_time, entry.end_time)} • {entry.hours_worked.toFixed(1)} hrs
                  </span>
                </div>
                
                {entry.entity_location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{entry.entity_location}</span>
                  </div>
                )}
                
                {entry.employee_name && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5 mr-1" />
                    <span>{entry.employee_name}</span>
                  </div>
                )}
                
                {entry.notes && (
                  <p className="text-sm mt-2 bg-muted/30 p-2 rounded">
                    {entry.notes}
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                {entry.has_receipts && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-[#0485ea]"
                    onClick={() => openReceiptsDialog(entry)}
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {entry.entity_type === 'work_order' && (
                      <DropdownMenuItem asChild>
                        <a href={`/work-orders/${entry.entity_id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span>View Work Order</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    {entry.entity_type === 'project' && (
                      <DropdownMenuItem asChild>
                        <a href={`/projects/${entry.entity_id}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          <span>View Project</span>
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => openReceiptsDialog(entry)}
                      className="text-blue-600"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{entry.has_receipts ? 'View Receipts' : 'Add Receipt'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600"
                      disabled={deletingEntryId === entry.id}
                    >
                      {deletingEntryId === entry.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      <span>Delete Entry</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className={isMobile ? "w-[95vw] max-w-lg" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle>Time Entry Receipts</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <TimeEntryReceipts 
              timeEntryId={selectedEntry.id} 
              onReceiptChange={onEntryChange}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryList;
