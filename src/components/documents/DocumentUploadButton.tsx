
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface DocumentUploadButtonProps {
  onUploadClick: () => void;
  className?: string;
}

const DocumentUploadButton: React.FC<DocumentUploadButtonProps> = ({
  onUploadClick,
  className
}) => {
  return (
    <Button
      onClick={onUploadClick}
      className={`bg-[#0485ea] hover:bg-[#0375d1] ${className || ''}`}
    >
      <Upload className="h-4 w-4 mr-2" />
      Upload
    </Button>
  );
};

export default DocumentUploadButton;
