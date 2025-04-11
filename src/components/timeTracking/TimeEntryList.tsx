
import { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Calendar, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { groupEntriesByDate, formatDateHeading, formatTime } from './utils/timeUtils';
import TimeEntryDeleteDialog from './TimeEntryDeleteDialog';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import TimeEntryReceipts from './TimeEntryReceipts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onEntryChange: () => void;
  isMobile?: boolean; // Add this prop to fix the error
}

export function TimeEntryList({ entries, isLoading, onEntryChange, isMobile = false }: TimeEntryListProps) {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);
  
  // Group entries by date
  const groupedEntries = groupEntriesByDate(entries);
  
  // Get dates sorted in descending order (newest first)
  const dates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  const handleViewDetails = (entityType: string, entityId: string) => {
    if (entityType === 'project') {
      navigate(`/projects/${entityId}`);
    } else if (entityType === 'work_order') {
      navigate(`/work-orders/${entityId}`);
    }
  };
  
  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowEditDialog(true);
  };
  
  const handleDeleteEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowDeleteDialog(true);
  };
  
  const handleViewReceipts = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setShowReceiptsDialog(true);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="text-center p-4 border-2 border-dashed rounded-lg mt-6">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium text-muted-foreground">No time entries found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Use the "Log Time" button to track your work hours.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {dates.map(date => (
        <Card key={date}>
          <div className="bg-[#0485ea]/10 px-4 py-2 font-semibold">
            {formatDateHeading(date)}
          </div>
          
          <CardContent className="p-0">
            {groupedEntries[date].map((entry) => (
              <div key={entry.id} className="p-4 border-b last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {entry.entity_name || 
                        (entry.entity_type === 'project' ? 'Project' : 'Work Order')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)} • 
                      {entry.hours_worked.toFixed(1)} hours
                    </div>
                    {entry.employee_name && (
                      <div className="text-sm">Employee: {entry.employee_name}</div>
                    )}
                    {entry.notes && (
                      <div className="text-sm mt-1 text-muted-foreground">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(entry.entity_type, entry.entity_id)}>
                        View {entry.entity_type === 'work_order' ? 'Work Order' : 'Project'}
                      </DropdownMenuItem>
                      {entry.has_receipts && (
                        <DropdownMenuItem onClick={() => handleViewReceipts(entry)}>
                          View Receipts
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                        Edit Entry
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteEntry(entry)}
                      >
                        Delete Entry
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      
      {/* Delete Dialog */}
      <TimeEntryDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        timeEntryId={selectedEntry?.id || ''}
        entry={selectedEntry || undefined}
        onSuccess={onEntryChange}
      />
      
      {/* Edit Dialog */}
      <TimeEntryEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        timeEntryId={selectedEntry?.id || ''}
        entry={selectedEntry || undefined}
        onSuccess={onEntryChange}
      />
      
      {/* Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Time Entry Receipts</DialogTitle>
          </DialogHeader>
          <TimeEntryReceipts 
            timeEntryId={selectedEntry?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
