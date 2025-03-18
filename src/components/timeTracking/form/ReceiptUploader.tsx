
import React from 'react';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';

interface ReceiptUploaderProps {
  selectedFiles: File[];
  onFilesSelected: (files: File[]) => void;
  onFileClear: (index: number) => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  selectedFiles,
  onFilesSelected,
  onFileClear
}) => {
  return (
    <div className="space-y-2">
      <Label>Add Receipts (Optional)</Label>
      <FileUpload
        onFilesSelected={onFilesSelected}
        onFileClear={onFileClear}
        selectedFiles={selectedFiles}
        allowMultiple={true}
        acceptedFileTypes="image/*,application/pdf"
        dropzoneText="Drag receipts here or click to upload"
      />
    </div>
  );
};

export default ReceiptUploader;
