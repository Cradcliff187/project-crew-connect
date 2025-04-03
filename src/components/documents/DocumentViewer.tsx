import React from 'react';
import { FileText } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface DocumentViewerProps {
  document: Document;
  embedded?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  embedded = false, 
  open, 
  onOpenChange 
}) => {
  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';
  
  // Calculate height based on embedded mode
  const viewerHeight = embedded ? 'h-full min-h-[300px]' : 'h-[400px]';
  
  const renderContent = () => {
    if (!document.url) {
      return (
        <div className={`flex flex-col items-center justify-center bg-muted/30 rounded-md ${viewerHeight}`}>
          <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-sm font-medium">Preview not available</h3>
          <p className="text-sm text-muted-foreground">Document URL is missing</p>
        </div>
      );
    }

    return (
      <div className={`w-full ${viewerHeight} bg-muted/30 rounded-md overflow-hidden`}>
        {isImage ? (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <img 
              src={document.url} 
              alt={document.file_name || 'Document preview'} 
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : isPdf ? (
          <iframe 
            src={document.url} 
            title={document.file_name || 'PDF Document'} 
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-sm font-medium">Preview not available</h3>
            <p className="text-sm text-muted-foreground">This file type cannot be previewed</p>
          </div>
        )}
      </div>
    );
  };

  // If open/onOpenChange are provided, render inside a dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Otherwise render directly
  return renderContent();
};

export default DocumentViewer;
