
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreditCard } from 'lucide-react';
import ReceiptMetadataForm from './ReceiptMetadataForm';
import { ReceiptMetadata } from '@/types/timeTracking';

interface ReceiptUploadManagerProps {
  hasReceipts: boolean;
  onHasReceiptsChange: (hasReceipts: boolean) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  metadata: ReceiptMetadata;
  onMetadataChange: (metadata: Partial<ReceiptMetadata>) => void;
  entityType?: string;
  entityId?: string;
  showToggle?: boolean;
  toggleLabel?: string;
}

/**
 * A standardized component for managing receipt uploads across different time tracking interfaces
 */
const ReceiptUploadManager: React.FC<ReceiptUploadManagerProps> = ({
  hasReceipts,
  onHasReceiptsChange,
  files,
  onFilesChange,
  metadata,
  onMetadataChange,
  entityType,
  entityId,
  showToggle = true,
  toggleLabel = "Attach Receipt(s)"
}) => {
  // Handlers
  const handleFilesSelected = (newFiles: File[]) => {
    onFilesChange(newFiles);
    
    // Auto-enable receipts when files are selected
    if (newFiles.length > 0 && !hasReceipts) {
      onHasReceiptsChange(true);
    }
  };
  
  const handleFileClear = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
    
    // Auto-disable receipts when no files remain
    if (updatedFiles.length === 0) {
      onHasReceiptsChange(false);
    }
  };
  
  const updateMetadata = (data: Partial<ReceiptMetadata>) => {
    onMetadataChange(data);
  };
  
  return (
    <div className="space-y-4">
      {showToggle && (
        <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
          <div>
            <h4 className="font-medium">{toggleLabel}</h4>
            <p className="text-sm text-muted-foreground">
              Do you have any receipts to upload for this time entry?
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Switch
              checked={hasReceipts}
              onCheckedChange={onHasReceiptsChange}
              className="data-[state=checked]:bg-[#0485ea]"
            />
          </div>
        </div>
      )}
      
      {hasReceipts && (
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <FileUpload
              onFilesSelected={handleFilesSelected}
              onFileClear={handleFileClear}
              selectedFiles={files}
              allowMultiple={true}
              acceptedFileTypes="image/*,application/pdf"
              dropzoneText="Drag receipts here or click to upload"
            />
          </div>
          
          {files.length > 0 && (
            <Card className="p-4">
              <div className="mb-3 font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-[#0485ea]" />
                Receipt Details
              </div>
              
              <ReceiptMetadataForm
                vendor={metadata.vendorId || ''}
                expenseType={metadata.expenseType || ''}
                amount={metadata.amount}
                onVendorChange={(value) => updateMetadata({ vendorId: value })}
                onExpenseTypeChange={(value) => updateMetadata({ expenseType: value })}
                onAmountChange={(value) => updateMetadata({ amount: value })}
                entityType={entityType}
                entityId={entityId}
                metadata={metadata}
                updateMetadata={updateMetadata}
                expenseDate={metadata.expenseDate || new Date()}
                onExpenseDateChange={(date) => updateMetadata({ expenseDate: date })}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptUploadManager;
