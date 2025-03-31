
import React from 'react';
import { PaperclipIcon, UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet } from '@/components/ui/sheet';

interface DocumentUploadHeaderProps {
  title: string;
  documentsCount: number;
  onOpenUpload: (e: React.MouseEvent) => void;
  isDocumentUploadOpen: boolean;
  setIsDocumentUploadOpen: (open: boolean) => void;
  children?: React.ReactNode;
}

const DocumentUploadHeader: React.FC<DocumentUploadHeaderProps> = ({
  title,
  documentsCount,
  onOpenUpload,
  isDocumentUploadOpen,
  setIsDocumentUploadOpen,
  children
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <PaperclipIcon className="h-4 w-4 text-[#0485ea]" />
        {title}
        {documentsCount > 0 && (
          <Badge variant="outline" className="ml-1 text-xs bg-blue-50">
            {documentsCount}
          </Badge>
        )}
      </h3>
      <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="bg-[#0485ea] text-white hover:bg-[#0375d1]"
          onClick={onOpenUpload}
        >
          <UploadIcon className="h-4 w-4 mr-1" />
          Add Document
        </Button>
        {children}
      </Sheet>
    </div>
  );
};

export default DocumentUploadHeader;
