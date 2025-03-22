
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TimeEntry } from '@/types/timeTracking';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { format } from 'date-fns';

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptDocument: {
    url: string;
    fileName: string;
    fileType: string;
  } | null;
}

export const ReceiptViewerDialog = ({ 
  open, 
  onOpenChange, 
  receiptDocument 
}: ReceiptViewerDialogProps) => {
  const handleClose = () => onOpenChange(false);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Receipt: {receiptDocument?.fileName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden h-[400px]">
            {receiptDocument?.fileType?.startsWith('image/') ? (
              <img
                src={receiptDocument.url}
                alt={receiptDocument.fileName}
                className="w-full h-full object-contain"
              />
            ) : receiptDocument?.fileType?.includes('pdf') ? (
              <iframe
                src={receiptDocument.url}
                title={receiptDocument.fileName}
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <p>Preview not available</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ReceiptUploadDialogProps {
  open: boolean;
  timeEntry: TimeEntry | null;
  onSuccess: (timeEntryId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
}

export const ReceiptUploadDialog = ({
  open,
  timeEntry,
  onSuccess,
  onCancel
}: ReceiptUploadDialogProps) => {
  if (!open || !timeEntry) return null;
  
  const handleSuccess = (documentId?: string) => {
    if (documentId && timeEntry) {
      onSuccess(timeEntry.id, documentId);
    }
  };
  
  // Prepare prefill data for the document upload
  const prefillData = {
    amount: 0,
    vendorId: timeEntry.vendor_id || undefined,
    entityType: timeEntry.entity_type.toUpperCase() as EntityType,
    entityId: timeEntry.entity_id,
    expenseDate: new Date(timeEntry.date_worked),
    notes: `Receipt for time entry on ${format(new Date(timeEntry.date_worked), 'MMM d, yyyy')}`
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Receipt for Time Entry</DialogTitle>
        </DialogHeader>
        <EnhancedDocumentUpload
          entityType={timeEntry.entity_type === 'work_order' ? 'WORK_ORDER' as EntityType : 'PROJECT' as EntityType}
          entityId={timeEntry.entity_id}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          isReceiptUpload={true}
          prefillData={prefillData}
        />
      </DialogContent>
    </Dialog>
  );
};
