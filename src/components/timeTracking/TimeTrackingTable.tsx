
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TimeEntry } from '@/types/timeTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatTimeRange, formatCurrency } from '@/lib/utils';
import { useReceiptManager } from './hooks/useReceiptManager';
import { ReceiptViewerDialog, ReceiptUploadDialog } from './dialogs/ReceiptDialog';
import ReceiptButton from './components/ReceiptButton';

const TimeTrackingTable = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use our receipt manager hook
  const {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedTimeEntry,
    setSelectedTimeEntry,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  } = useReceiptManager();
  
  const fetchTimeEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('date_worked', { ascending: false });
        
      if (error) throw error;
      
      setTimeEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching time entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load time entries: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTimeEntries();
  }, []);
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time entry?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Also delete any receipts
      await supabase
        .from('time_entry_receipts')
        .delete()
        .eq('time_entry_id', id);
        
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been deleted successfully.',
      });
      
      // Refresh data
      fetchTimeEntries();
    } catch (error: any) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete time entry: ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Handle receipt attachment
  const handleReceiptAttached = async (timeEntryId: string, documentId: string) => {
    try {
      // Update the time entry to mark it as having receipts
      const { error } = await supabase
        .from('time_entries')
        .update({ has_receipts: true })
        .eq('id', timeEntryId);
        
      if (error) throw error;
      
      // Create a record in time_entry_receipts
      const { data: fileData } = await supabase
        .from('documents')
        .select('file_name, file_type, file_size, storage_path')
        .eq('document_id', documentId)
        .single();
        
      if (fileData) {
        await supabase
          .from('time_entry_receipts')
          .insert({
            time_entry_id: timeEntryId,
            document_id: documentId,
            file_name: fileData.file_name,
            file_type: fileData.file_type,
            file_size: fileData.file_size,
            storage_path: fileData.storage_path,
            uploaded_at: new Date().toISOString()
          });
      }
      
      toast({
        title: 'Receipt attached',
        description: 'The receipt has been attached to this time entry.',
      });
      
      setShowReceiptUpload(false);
      
      // Refresh data
      fetchTimeEntries();
    } catch (error: any) {
      console.error('Error attaching receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach receipt: ' + error.message,
        variant: 'destructive',
      });
    }
  };
  
  // Format entity name
  const formatEntityName = (entry: TimeEntry) => {
    if (!entry) return 'Unknown';
    return entry.entity_name || `${entry.entity_type === 'work_order' ? 'WO' : 'Project'} #${entry.entity_id.slice(0, 6)}`;
  };
  
  return (
    <div>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : timeEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No time entries found. Click the "Log Time" button to add a new entry.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Labor Cost</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date_worked), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{formatTimeRange(entry.start_time, entry.end_time)}</TableCell>
                  <TableCell>{entry.hours_worked}</TableCell>
                  <TableCell className="capitalize">{formatEntityName(entry)}</TableCell>
                  <TableCell>{entry.employee_name || 'Unassigned'}</TableCell>
                  <TableCell>
                    {formatCurrency(entry.hours_worked * (entry.employee_rate || 75))}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <ReceiptButton timeEntry={entry} onClick={handleReceiptClick} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Receipt Viewer Dialog */}
      <ReceiptViewerDialog
        open={viewingReceipt}
        onOpenChange={(open) => !open && handleCloseReceiptViewer()}
        receiptDocument={receiptDocument}
      />
      
      {/* Receipt Upload Dialog */}
      <ReceiptUploadDialog
        open={showReceiptUpload}
        timeEntry={selectedTimeEntry}
        onSuccess={handleReceiptAttached}
        onCancel={() => setShowReceiptUpload(false)}
      />
    </div>
  );
};

export default TimeTrackingTable;
