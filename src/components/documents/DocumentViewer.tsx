
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, X, AlertTriangle, FileImage, File } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const DocumentViewer = ({
  document,
  open,
  onOpenChange,
  title,
  description
}: DocumentViewerProps) => {
  const [error, setError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const mountedRef = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle component mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanupIframe();
    };
  }, []);

  // Reset state when document changes or dialog opens/closes
  useEffect(() => {
    if (mountedRef.current) {
      setError(false);
      setLoadAttempted(false);
    }
    
    // Cleanup when dialog closes
    if (!open) {
      cleanupIframe();
    }
  }, [document, open]);
  
  // Force load attempt after component mount
  useEffect(() => {
    if (open && !loadAttempted && mountedRef.current) {
      setLoadAttempted(true);
      if (document) {
        console.log('Viewing document:', {
          id: document.document_id,
          name: document.file_name,
          type: document.file_type,
          url: document.url
        });
      }
    }
  }, [open, loadAttempted, document]);

  const cleanupIframe = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.src = 'about:blank';
      } catch (e) {
        console.log('Error cleaning up iframe:', e);
      }
    }
  };

  if (!document) return null;

  const handleViewError = () => {
    if (mountedRef.current) {
      console.log('Error viewing document:', document.file_name);
      setError(true);
    }
  };

  // Determine content type for appropriate display
  const getContentType = () => {
    if (!document.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    return 'other';
  };

  // Get appropriate icon for the file type
  const getFileIcon = () => {
    const contentType = getContentType();
    
    switch (contentType) {
      case 'image':
        return <FileImage className="h-12 w-12 text-[#0485ea]" />;
      case 'pdf':
        return <FileText className="h-12 w-12 text-red-500" />;
      default:
        return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  const contentType = getContentType();
  const dialogTitle = title || document.file_name;
  const dialogDescription = description || (document.category ? 
    `${document.category.charAt(0).toUpperCase() + document.category.slice(1)} - ${formatDate(document.created_at)}` : 
    formatDate(document.created_at));

  // Handle closing dialog to avoid UI lockups
  const handleClose = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.src = 'about:blank';
      } catch (e) {
        console.log('Error cleaning up iframe in handleClose:', e);
      }
    }
    
    setTimeout(() => {
      if (mountedRef.current) {
        onOpenChange(false);
      }
    }, 50);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-lg font-semibold">{dialogTitle}</DialogTitle>
            <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
              <span>{dialogDescription}</span>
              {document.category && (
                <Badge variant="outline" className="capitalize bg-[#0485ea]/5 text-[#0485ea] border-[#0485ea]/30">
                  {document.category}
                </Badge>
              )}
              {document.entity_type && (
                <Badge variant="secondary" className="capitalize">
                  {document.entity_type.replace(/_/g, ' ').toLowerCase()}
                </Badge>
              )}
              {document.version && (
                <Badge variant="outline" className="bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/30">
                  Version {document.version}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="p-2 border rounded-md h-[65vh] overflow-auto bg-gray-50">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive font-semibold mb-2">Error loading document</p>
              <p className="text-sm text-muted-foreground mb-4">
                The document couldn't be loaded in the viewer.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(document.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </Button>
            </div>
          ) : contentType === 'image' ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={document.url}
                alt={document.file_name}
                className="max-w-full max-h-[60vh] object-contain"
                onError={handleViewError}
              />
            </div>
          ) : contentType === 'pdf' ? (
            <iframe
              ref={iframeRef}
              src={document.url}
              className="w-full h-full border-0"
              title={document.file_name}
              onError={handleViewError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              {getFileIcon()}
              <p className="font-medium mt-4 mb-2">Cannot preview this file type</p>
              <p className="text-sm text-muted-foreground mb-4">
                {document.file_type || 'Unknown file type'}
              </p>
              <Button
                variant="outline"
                onClick={() => window.open(document.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open document
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between mt-4 gap-2">
          <div className="flex-1 text-xs text-muted-foreground">
            {document.file_size && (
              <span>{(document.file_size / 1024).toFixed(2)} KB</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(document.url, '_blank')}
              size="sm"
              className="border-[#0485ea] text-[#0485ea] hover:bg-[#0485ea]/5"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
