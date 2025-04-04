
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Edit, 
  Receipt,
  Loader2
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TimeEntry } from '@/types/timeTracking';
import TimeEntryReceipts from './TimeEntryReceipts';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onEntryChange?: () => void;
  isMobile?: boolean;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ 
  timeEntries, 
  isLoading,
  onEntryChange,
  isMobile = false 
}) => {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = (entry: TimeEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntryToDelete(entry);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    
    setDeleting(true);
    try {
      // First check if there are any receipts attached
      const { data: documentLinks } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', entryToDelete.id);
        
      // If there are documents, delete them first
      if (documentLinks && documentLinks.length > 0) {
        // Get the document details to get storage paths
        const documentIds = documentLinks.map(link => link.document_id);
        const { data: documents } = await supabase
          .from('documents')
          .select('storage_path, document_id')
          .in('document_id', documentIds);
          
        // Delete the files from storage
        if (documents && documents.length > 0) {
          for (const doc of documents) {
            await supabase.storage
              .from('construction_documents')
              .remove([doc.storage_path]);
          }
        }
        
        // Delete the document links
        await supabase
          .from('time_entry_document_links')
          .delete()
          .eq('time_entry_id', entryToDelete.id);
          
        // Delete the documents
        for (const docId of documentIds) {
          await supabase
            .from('documents')
            .delete()
            .eq('document_id', docId);
        }
      }
      
      // Now delete any expenses linked to this time entry
      await supabase
        .from('expenses')
        .delete()
        .eq('time_entry_id', entryToDelete.id);
        
      // Finally, delete the time entry itself
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Entry deleted',
        description: 'The time entry has been removed',
      });
      
      if (onEntryChange) {
        onEntryChange();
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Could not delete the time entry',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        <span className="ml-2">Loading time entries...</span>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md">
        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p>No time entries for this date.</p>
        <p className="text-sm text-muted-foreground mt-1">Add a time entry to track your hours.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Accordion type="single" collapsible value={expandedEntry || undefined} onValueChange={setExpandedEntry}>
        {timeEntries.map((entry) => (
          <AccordionItem key={entry.id} value={entry.id} className="border rounded-md mb-2">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex flex-col sm:flex-row sm:items-center w-full">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium">{entry.entity_name || `${entry.entity_type}: ${entry.entity_id}`}</div>
                    {entry.has_receipts && (
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        Receipt
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                  </div>
                </div>
                <div className="flex items-center mt-2 sm:mt-0">
                  <div className="mr-4">
                    <span className="text-[#0485ea] font-semibold">{entry.hours_worked.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-1">hrs</span>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleDeleteClick(entry, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Date</p>
                    <p>{format(new Date(entry.date_worked), 'MMMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="font-medium">Hours</p>
                    <p>{entry.hours_worked.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Entity</p>
                    <p>{entry.entity_type.charAt(0).toUpperCase() + entry.entity_type.slice(1)}</p>
                  </div>
                  <div>
                    <p className="font-medium">ID</p>
                    <p className="truncate">{entry.entity_id}</p>
                  </div>
                  {entry.employee_name && (
                    <div>
                      <p className="font-medium">Employee</p>
                      <p>{entry.employee_name}</p>
                    </div>
                  )}
                  {entry.employee_rate && (
                    <div>
                      <p className="font-medium">Rate</p>
                      <p>${entry.employee_rate.toFixed(2)}/hr</p>
                    </div>
                  )}
                </div>
                
                {entry.notes && (
                  <div className="text-sm">
                    <p className="font-medium">Notes</p>
                    <p className="whitespace-pre-wrap">{entry.notes}</p>
                  </div>
                )}
                
                {entry.has_receipts && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Receipts</h4>
                    <TimeEntryReceipts 
                      timeEntryId={entry.id} 
                      onReceiptChange={onEntryChange}
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Time Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this time entry? This will also delete any attached receipts. This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryList;
