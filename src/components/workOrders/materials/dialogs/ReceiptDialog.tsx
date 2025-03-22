
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WorkOrderMaterial } from '@/types/workOrder';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { FileText, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  
  if (!receiptDocument) return null;

  const handleOpenInNewTab = () => {
    window.open(receiptDocument.url, '_blank');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Receipt: {receiptDocument?.fileName}</DialogTitle>
          <DialogDescription>
            View the uploaded receipt document
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden h-[400px] bg-gray-50">
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
              <div className="flex items-center justify-center h-full flex-col gap-2">
                <FileText size={48} className="text-gray-400" />
                <p>Preview not available</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" /> Open in New Tab
            </Button>
            <Button onClick={handleClose} className="bg-[#0485ea] hover:bg-[#0375d1]">Close</Button>
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
          <DialogDescription>
            Upload a receipt for {material.material_name}
            {material.vendor_id && vendorName ? ` from ${vendorName}` : ''}
            {material.total_price ? ` (${formatCurrency(material.total_price)})` : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <EnhancedDocumentUpload
            entityType="WORK_ORDER"
            entityId={workOrderId}
            onSuccess={(documentId) => documentId && onSuccess(material.id, documentId)}
            onCancel={onCancel}
            isReceiptUpload={true}
            prefillData={{
              amount: material.total_price,
              vendorId: material.vendor_id || undefined,
              materialName: material.material_name
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Import this at the top to avoid circular dependencies
import { MaterialReceiptUpload } from '../components';
