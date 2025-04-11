
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, ExternalLink, X } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { downloadDocument, openDocumentInNewTab } from './utils/documentUtils';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showActions?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  title,
  size = 'xl',
  showActions = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get content type based on file type
  const getContentType = (fileType?: string) => {
    if (!fileType) return 'application/octet-stream';
    
    // Return appropriate content type for common file types
    if (fileType.includes('pdf')) return 'application/pdf';
    if (fileType.includes('image')) return fileType;
    if (fileType.includes('text')) return 'text/plain';
    
    return 'application/octet-stream';
  };

  // Handle download click
  const handleDownload = () => {
    if (!document) return;
    downloadDocument(document);
  };

  // Handle open in new tab
  const handleOpenInNewTab = () => {
    if (!document) return;
    openDocumentInNewTab(document);
  };

  // Determine if we can render the document inline
  const canRenderInline = (fileType?: string) => {
    if (!fileType) return false;
    return fileType.includes('pdf') || fileType.includes('image');
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to load document');
  };

  // Get dialog content class based on size
  const getDialogContentClass = () => {
    switch (size) {
      case 'sm': return 'sm:max-w-md';
      case 'md': return 'sm:max-w-lg';
      case 'lg': return 'sm:max-w-2xl';
      case 'xl': return 'sm:max-w-4xl';
      case 'full': return 'w-[90vw] max-w-[90vw]';
      default: return 'sm:max-w-4xl';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn("p-0 gap-0 h-[80vh]", getDialogContentClass())}
        onInteractOutside={e => e.preventDefault()} // Prevent closing when clicking outside
      >
        <DialogHeader className="px-4 py-2 border-b flex flex-row justify-between items-center">
          <DialogTitle className="text-lg truncate">
            {title || (document && document.file_name) || 'Document Viewer'}
          </DialogTitle>
          {showActions && document && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-auto relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0485ea]"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center text-red-500">
                <p className="mb-2">{error}</p>
                <Button variant="outline" onClick={handleOpenInNewTab}>Open in New Tab</Button>
              </div>
            </div>
          )}
          
          {document && document.url && canRenderInline(document.file_type) && (
            <iframe
              src={document.url}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={document.file_name}
            />
          )}
          
          {document && document.url && !canRenderInline(document.file_type) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="mb-4">This file type cannot be previewed</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleDownload}>Download</Button>
                  <Button variant="outline" onClick={handleOpenInNewTab}>Open in New Tab</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
