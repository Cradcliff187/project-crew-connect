
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WorkOrderMaterial } from '@/types/workOrder';

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
  material: WorkOrderMaterial | null;
  workOrderId: string;
  vendorName: string;
  onSuccess: (materialId: string, documentId: string) => Promise<void>;
  onCancel: () => void;
}

export const ReceiptUploadDialog = ({
  open,
  material,
  workOrderId,
  vendorName,
  onSuccess,
  onCancel
}: ReceiptUploadDialogProps) => {
  if (!open || !material) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-40">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Upload Receipt</h3>
        <MaterialReceiptUpload
          workOrderId={workOrderId}
          material={material}
          vendorName={vendorName}
          onSuccess={(documentId) => onSuccess(material.id, documentId)}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
};

// Import this at the top to avoid circular dependencies
import { MaterialReceiptUpload } from '../components';
