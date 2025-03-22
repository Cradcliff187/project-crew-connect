
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';
import { ReceiptViewerDialog } from '../dialogs/ReceiptDialog';
import TimeEntryDetail from '../TimeEntryDetail';
import TimeEntryEdit from '../TimeEntryEdit';

interface TimeEntryDialogsProps {
  showDetailDialog: boolean;
  setShowDetailDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  showReceiptsDialog: boolean;
  setShowReceiptsDialog: (show: boolean) => void;
  selectedEntry: TimeEntry | null;
  setSelectedEntry: (entry: TimeEntry | null) => void;
  currentReceipts: any[];
  viewingReceipt: boolean;
  setViewingReceipt: (viewing: boolean) => void;
  receiptDocument: any;
  handleFormSuccess: () => void;
  handleDeleteEntry: (id: string) => Promise<void>;
}

const TimeEntryDialogs = ({
  showDetailDialog,
  setShowDetailDialog,
  showEditDialog,
  setShowEditDialog,
  showDeleteDialog,
  setShowDeleteDialog,
  showReceiptsDialog,
  setShowReceiptsDialog,
  selectedEntry,
  setSelectedEntry,
  currentReceipts,
  viewingReceipt,
  setViewingReceipt,
  receiptDocument,
  handleFormSuccess,
  handleDeleteEntry
}: TimeEntryDialogsProps) => {
  
  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setShowDetailDialog(false);
    setSelectedEntry(null);
  };

  // Execute delete operation
  const executeDelete = async () => {
    if (selectedEntry) {
      await handleDeleteEntry(selectedEntry.id);
      setShowDeleteDialog(false);
      setSelectedEntry(null);
    }
  };
  
  return (
    <>
      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          {selectedEntry && (
            <TimeEntryDetail
              timeEntry={selectedEntry}
              onEdit={() => {
                setShowDetailDialog(false);
                setShowEditDialog(true);
              }}
              onDelete={() => {
                setShowDetailDialog(false);
                setShowDeleteDialog(true);
              }}
              onClose={() => setShowDetailDialog(false)}
              onViewReceipts={async () => {
                if (selectedEntry) {
                  try {
                    const { data: receipts, error } = await supabase
                      .from('time_entry_receipts')
                      .select('*')
                      .eq('time_entry_id', selectedEntry.id);
                      
                    if (error) throw error;
                    
                    if (receipts && receipts.length > 0) {
                      const receiptsWithUrls = await Promise.all(receipts.map(async (receipt) => {
                        const { data, error } = await supabase.storage
                          .from('construction_documents')
                          .createSignedUrl(receipt.storage_path, 3600);
                          
                        return {
                          ...receipt,
                          url: error ? null : data?.signedUrl
                        };
                      }));
                      
                      setCurrentReceipts(receiptsWithUrls);
                      setShowReceiptsDialog(true);
                    } else {
                      toast({
                        title: 'No receipts',
                        description: 'No receipts were found for this time entry.',
                      });
                    }
                  } catch (error) {
                    console.error('Error fetching receipts:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to load receipts for this time entry.',
                      variant: 'destructive',
                    });
                  }
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          {selectedEntry && (
            <TimeEntryEdit
              timeEntry={selectedEntry}
              onCancel={() => setShowEditDialog(false)}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={executeDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="max-w-3xl">
          <div className="space-y-4">
            <div className="font-semibold text-lg">
              Receipt Details
              {selectedEntry && (
                <div className="text-sm font-normal text-muted-foreground">
                  {selectedEntry.entity_name} - {formatDate(selectedEntry.date_worked)}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {currentReceipts.map((receipt, index) => (
                <div key={index} className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm truncate">{receipt.file_name}</h3>
                    {receipt.amount && (
                      <span className="text-sm font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        ${receipt.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {receipt.url ? (
                    receipt.file_type?.startsWith('image/') ? (
                      <div className="h-48 flex items-center justify-center border rounded-md overflow-hidden">
                        <img 
                          src={receipt.url} 
                          alt={receipt.file_name} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(receipt.url, '_blank')}
                        >
                          View Document
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500">Unable to load preview</div>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {(receipt.file_size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span>
                      {new Date(receipt.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowReceiptsDialog(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Dialog */}
      <ReceiptViewerDialog
        open={viewingReceipt}
        onOpenChange={setViewingReceipt}
        receiptDocument={receiptDocument}
      />
    </>
  );
};

export default TimeEntryDialogs;
