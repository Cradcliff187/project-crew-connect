
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface DocumentUploadButtonProps extends ButtonProps {
  isUploading?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
  label?: string;
  cancelLabel?: string;
}

const DocumentUploadButton: React.FC<DocumentUploadButtonProps> = ({
  isUploading = false,
  showCancel = false,
  onCancel,
  label = 'Upload Document',
  cancelLabel = 'Cancel Upload',
  className = '',
  ...props
}) => {
  if (showCancel) {
    return (
      <Button
        variant="outline"
        className={`text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50 ${className}`}
        onClick={onCancel}
        type="button"
        {...props}
      >
        <X className="h-4 w-4 mr-1" />
        {cancelLabel}
      </Button>
    );
  }

  return (
    <Button
      className={`bg-[#0485ea] hover:bg-[#0375d1] ${isUploading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isUploading}
      {...props}
    >
      {isUploading ? (
        <div className="flex items-center">
          <span className="loading loading-spinner loading-xs mr-2"></span>
          Uploading...
        </div>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
};

export default DocumentUploadButton;
