
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TimeEntryDetail from '../TimeEntryDetail';
import TimeEntryEdit from '../TimeEntryEdit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DialogContent as ReceiptDialogContent } from '@/components/ui/dialog';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from '@/hooks/use-toast';

interface TimeEntryDialogsProps {
  showDetailDialog: boolean;
  setShowDetailDialog: (show: boolean) => void;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;
  showReceiptsDialog: boolean;
  setShowReceiptsDialog: (show: boolean) => void;
  selectedEntry: any;
  setSelectedEntry: (entry: any) => void;
  currentReceipts: any[];
  viewingReceipt: any;
  setViewingReceipt: (receipt: any) => void;
  receiptDocument: any;
  handleFormSuccess: () => void;
  handleDeleteEntry: (id: string) => Promise<void>;
}

const TimeEntryDialogs: React.FC<TimeEntryDialogsProps> = ({
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
}) => {
  const { toast } = useToast();

  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setShowDetailDialog(false);
    setTimeout(() => setSelectedEntry(null), 200);
  };

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setTimeout(() => setSelectedEntry(null), 200);
  };

  // Handle view receipts
  const handleViewReceiptDetail = (receipt: any) => {
    setViewingReceipt(receipt);
  };

  // Handle receipt viewer close
  const handleCloseReceiptViewer = () => {
    setViewingReceipt(null);
  };

  return (
    <>
      {/* Time Entry Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-lg">
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
              onClose={handleCloseDetailDialog}
              onViewReceipts={async () => {
                try {
                  // When viewing receipts from the detail dialog,
                  // we close the detail and open the receipts dialog
                  setShowDetailDialog(false);
                  // Use the handleViewReceipts from the parent component
                  if (selectedEntry) {
                    await handleViewReceipts(selectedEntry.id);
                  }
                } catch (error) {
                  console.error('Error viewing receipts:', error);
                  toast({
                    title: 'Error',
                    description: 'Could not load receipts.',
                    variant: 'destructive',
                  });
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Time Entry Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          {selectedEntry && (
            <TimeEntryEdit
              timeEntry={selectedEntry}
              onCancel={handleCloseEditDialog}
              onSuccess={handleFormSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this time entry
              and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (selectedEntry) {
                  await handleDeleteEntry(selectedEntry.id);
                  setShowDeleteDialog(false);
                  setSelectedEntry(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipts Dialog */}
      <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
        <DialogContent className="sm:max-w-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Receipts & Documents</h3>
            {currentReceipts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {currentReceipts.map((receipt) => (
                  <Button
                    key={receipt.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center justify-center text-center gap-2"
                    onClick={() => handleViewReceiptDetail(receipt)}
                  >
                    <div className="text-sm font-medium truncate w-full">
                      {receipt.filename || 'Receipt'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Click to view
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No receipts available for this entry.
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setShowReceiptsDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer */}
      <Sheet open={!!viewingReceipt} onOpenChange={(open) => !open && handleCloseReceiptViewer()}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium">
              {viewingReceipt?.filename || 'Receipt'}
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-6">
            {receiptDocument ? (
              <iframe
                src={receiptDocument}
                className="w-full h-full"
                title="Receipt Document"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  Loading receipt...
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 border-t flex justify-end">
            <Button onClick={handleCloseReceiptViewer}>
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TimeEntryDialogs;
