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
  onFileClear,
}) => {
  const handleFilesSelected = (files: File[]) => {
    console.log(
      'Files selected in ReceiptUploader:',
      files.map(f => f.name)
    );
    onFilesSelected(files);
  };

  return (
    <div className="space-y-2">
      <Label>Add Receipts</Label>
      <FileUpload
        onFilesSelected={handleFilesSelected}
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
