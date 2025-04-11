
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, File as FileIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document } from './schemas/documentSchema';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentList?: Document[];
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  documentList,
  onNext,
  onPrevious,
  showNavigation = false
}) => {
  const [loading, setLoading] = useState(false);
  
  // Handle document download
  const handleDownload = () => {
    if (document?.url) {
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Determine if navigation buttons should be visible
  const showNavigationButtons = showNavigation && documentList && documentList.length > 1;
  
  // Determine content type for rendering
  const getContentByType = () => {
    if (!document) return null;
    
    const fileType = document.file_type || '';
    
    if (fileType.includes('image')) {
      return (
        <div className="flex justify-center">
          <img 
            src={document.url} 
            alt={document.file_name} 
            className="max-h-[70vh] object-contain"
            onLoad={() => setLoading(false)}
          />
        </div>
      );
    }
    
    if (fileType.includes('pdf')) {
      return (
        <iframe 
          src={document.url} 
          className="w-full h-[70vh]"
          title={document.file_name}
          onLoad={() => setLoading(false)}
        />
      );
    }
    
    // For other file types
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <FileIcon className="h-20 w-20 text-gray-400 mb-4" />
        <p className="text-lg font-medium">{document.file_name}</p>
        <p className="text-sm text-muted-foreground mb-4">
          This file preview is not available.
        </p>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => {
            if (document.url) {
              window.open(document.url, '_blank');
            }
          }}
        >
          Open in New Tab
        </Button>
      </div>
    );
  };
  
  if (!document) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 flex flex-row items-center justify-between border-b">
          <DialogTitle className="mr-8 truncate">{document.file_name}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (document.url) {
                  window.open(document.url, '_blank');
                }
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="animate-spin h-8 w-8 border-2 border-[#0485ea] border-t-transparent rounded-full"></div>
            </div>
          )}
          
          <div className="p-4">
            {getContentByType()}
          </div>
          
          {showNavigationButtons && (
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
              <Button 
                variant="outline" 
                size="icon"
                className="bg-white/80 hover:bg-white pointer-events-auto"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="bg-white/80 hover:bg-white pointer-events-auto"
                onClick={onNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {document.notes && (
          <div className="p-4 border-t bg-gray-50">
            <h4 className="text-sm font-medium mb-1">Notes:</h4>
            <p className="text-sm text-muted-foreground">{document.notes}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
