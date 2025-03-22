
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/types/timeTracking';
import TimeEntryDetail from '../TimeEntryDetail';
import TimeEntryEdit from '../TimeEntryEdit';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface TimeEntryDialogsProps {
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
  viewingReceipt: any;
  setViewingReceipt: (receipt: any) => void;
  receiptDocument: any;
  handleFormSuccess: () => void;
  handleDeleteEntry: (id: string) => void;
  handleViewReceipts: (id: string) => Promise<void>;
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
  handleDeleteEntry,
  handleViewReceipts
}) => {
  return (
    <>
      {/* Time Entry Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <TimeEntryDetail 
              timeEntry={selectedEntry}
              onClose={() => setShowDetailDialog(false)}
              onEdit={() => {
                setShowDetailDialog(false);
                setShowEditDialog(true);
              }}
              onDelete={() => {
                setShowDetailDialog(false);
                setShowDeleteDialog(true);
              }}
              onViewReceipts={() => {
                setShowDetailDialog(false);
                if (selectedEntry) {
                  handleViewReceipts(selectedEntry.id);
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Time Entry Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (selectedEntry) {
                  handleDeleteEntry(selectedEntry.id);
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
      {showReceiptsDialog && selectedEntry && (
        <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold mb-4">Receipts for {selectedEntry.entity_name}</h2>
              
              {viewingReceipt ? (
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    className="mb-4"
                    onClick={() => setViewingReceipt(null)}
                  >
                    ← Back to receipts
                  </Button>
                  
                  <div className="border rounded-md p-2 bg-white">
                    {receiptDocument}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentReceipts.map((receipt) => (
                    <div 
                      key={receipt.id} 
                      className="border rounded-md p-4 cursor-pointer hover:shadow-md"
                      onClick={() => setViewingReceipt(receipt)}
                    >
                      <div className="text-sm font-medium">{receipt.file_name || 'Receipt'}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(receipt.created_at).toLocaleDateString()}
                      </div>
                      {receipt.amount && (
                        <div className="mt-2 text-sm font-semibold">${receipt.amount.toFixed(2)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TimeEntryDialogs;
