
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { WorkOrderExpense } from '@/types/workOrder';
import { Document } from '@/components/documents/schemas/documentSchema';
import ExpenseReceiptUpload from '../components/ExpenseReceiptUpload';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, ExternalLink, File, X, Download } from 'lucide-react';

interface ReceiptUploadDialogProps {
  open: boolean;
  expense: WorkOrderExpense | null;
  workOrderId: string;
  vendorName: string;
  onSuccess: (expenseId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
}

export const ReceiptUploadDialog = ({
  open,
  expense,
  workOrderId,
  vendorName,
  onSuccess,
  onCancel,
}: ReceiptUploadDialogProps) => {
  if (!expense) return null;

  const handleReceiptSuccess = (documentId?: string) => {
    if (documentId) {
      onSuccess(expense.id, documentId);
    } else {
      // Even if no documentId, still call onCancel to close the dialog
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
          <DialogDescription>
            Upload a receipt for this expense item
          </DialogDescription>
        </DialogHeader>
        <ExpenseReceiptUpload
          workOrderId={workOrderId}
          expense={expense}
          vendorName={vendorName}
          onSuccess={handleReceiptSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

interface ReceiptViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptDocument: Document | null;
}

export const ReceiptViewerDialog = ({
  open,
  onOpenChange,
  receiptDocument,
}: ReceiptViewerDialogProps) => {
  const [error, setError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const mountedRef = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle component unmounting
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clean up any iframe resources
      if (iframeRef.current) {
        try {
          // Clear src to stop any ongoing loads
          iframeRef.current.src = 'about:blank';
        } catch (e) {
          console.log('Error cleaning up iframe:', e);
        }
      }
    };
  }, []);

  // Reset state when document changes or dialog opens/closes
  useEffect(() => {
    if (mountedRef.current) {
      setError(false);
      setLoadAttempted(false);
    }
    
    // When dialog is closed, perform additional cleanup
    if (!open && iframeRef.current) {
      try {
        // Clear src to stop any ongoing loads
        iframeRef.current.src = 'about:blank';
      } catch (e) {
        console.log('Error cleaning up iframe on close:', e);
      }
    }
  }, [receiptDocument, open]);
  
  // Force load attempt after component mount
  useEffect(() => {
    if (open && !loadAttempted && mountedRef.current) {
      setLoadAttempted(true);
    }
  }, [open, loadAttempted]);

  // Log document info for debugging
  useEffect(() => {
    if (receiptDocument && open) {
      console.log('Viewing receipt document:', {
        id: receiptDocument.document_id,
        fileName: receiptDocument.file_name,
        fileType: receiptDocument.file_type,
        url: receiptDocument.url
      });
    }
  }, [receiptDocument, open]);

  if (!receiptDocument) return null;

  // Check file type to determine display method
  const getFileType = () => {
    if (!receiptDocument.file_type) return 'unknown';
    
    const fileType = receiptDocument.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('doc')) return 'word';
    if (fileType.includes('xls')) return 'excel';
    return 'other';
  };

  const handleImageError = () => {
    if (mountedRef.current) {
      console.log('Error loading document:', receiptDocument.url);
      console.log('Document type:', receiptDocument.file_type);
      setError(true);
    }
  };

  const fileType = getFileType();

  // Handle closing dialog explicitly to avoid UI lockups
  const handleClose = () => {
    if (mountedRef.current) {
      // Explicitly clean up iframe
      if (iframeRef.current) {
        try {
          iframeRef.current.src = 'about:blank';
        } catch (e) {
          console.log('Error cleaning up iframe in handleClose:', e);
        }
      }
      
      // Small delay to ensure cleanup happens before dialog state changes
      setTimeout(() => {
        if (mountedRef.current) {
          onOpenChange(false);
        }
      }, 10);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Receipt: {receiptDocument.file_name}</DialogTitle>
          <DialogDescription>
            {receiptDocument.file_type || 'Document'} preview
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          {error ? (
            <div className="text-center p-4">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2 font-semibold">Error loading receipt</p>
              <p className="text-sm text-muted-foreground mb-4">
                The receipt could not be loaded directly in this view.
              </p>
              <Button
                variant="outline"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => window.open(receiptDocument.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </Button>
            </div>
          ) : fileType === 'image' ? (
            <AspectRatio ratio={4 / 5} className="flex items-center justify-center">
              <img
                src={receiptDocument.url}
                alt="Receipt"
                className="max-h-[60vh] object-contain"
                onError={handleImageError}
              />
            </AspectRatio>
          ) : fileType === 'pdf' ? (
            <iframe
              ref={iframeRef}
              src={receiptDocument.url}
              className="w-full h-[60vh]"
              title="Receipt PDF"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center p-4">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">This file type cannot be previewed</p>
              <p className="text-sm text-muted-foreground mb-4">
                {receiptDocument.file_type || 'Unknown file type'}
              </p>
              <Button
                variant="outline"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => window.open(receiptDocument.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open document
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => window.open(receiptDocument.url, '_blank')}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleClose} variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
