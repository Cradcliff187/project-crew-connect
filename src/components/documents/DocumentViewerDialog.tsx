
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Document } from './schemas/documentSchema';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, ExternalLink, Download, X } from 'lucide-react';

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  title?: string;
  description?: string;
}

const DocumentViewerDialog = ({
  open,
  onOpenChange,
  document,
  title,
  description
}: DocumentViewerDialogProps) => {
  const [error, setError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const mountedRef = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle component unmounting
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
    
    // When dialog is closed, perform additional cleanup
    if (!open) {
      cleanupIframe();
    }
  }, [document, open]);
  
  // Force load attempt after component mount
  useEffect(() => {
    if (open && !loadAttempted && mountedRef.current) {
      setLoadAttempted(true);
    }
  }, [open, loadAttempted]);

  // Log document info for debugging
  useEffect(() => {
    if (document && open) {
      console.log('Viewing document:', {
        id: document.document_id,
        fileName: document.file_name,
        fileType: document.file_type,
        url: document.url
      });
    }
  }, [document, open]);

  // Helper function to clean up iframe
  const cleanupIframe = () => {
    if (iframeRef.current) {
      try {
        // Clear src to stop any ongoing loads
        iframeRef.current.src = 'about:blank';
      } catch (e) {
        console.log('Error cleaning up iframe:', e);
      }
    }
  };

  if (!document) return null;

  // Check file type to determine display method
  const getFileType = () => {
    if (!document.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('doc')) return 'word';
    if (fileType.includes('xls')) return 'excel';
    return 'other';
  };

  const handleImageError = () => {
    if (mountedRef.current) {
      console.log('Error loading document:', document.url);
      console.log('Document type:', document.file_type);
      setError(true);
    }
  };

  const fileType = getFileType();

  // Handle closing dialog explicitly to avoid UI lockups
  const handleClose = () => {
    if (mountedRef.current) {
      cleanupIframe();
      
      // Small delay to ensure cleanup happens before dialog state changes
      setTimeout(() => {
        if (mountedRef.current) {
          onOpenChange(false);
        }
      }, 50);
    }
  };

  const dialogTitle = title || `Document: ${document.file_name}`;
  const dialogDescription = description || `${document.file_type || 'Document'} preview`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          {error ? (
            <div className="text-center p-4">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <p className="text-destructive mb-2 font-semibold">Error loading document</p>
              <p className="text-sm text-muted-foreground mb-4">
                The document could not be loaded directly in this view.
              </p>
              <Button
                variant="outline"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => window.open(document.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </Button>
            </div>
          ) : fileType === 'image' ? (
            <AspectRatio ratio={4 / 5} className="flex items-center justify-center">
              <img
                src={document.url}
                alt="Document"
                className="max-h-[60vh] object-contain"
                onError={handleImageError}
              />
            </AspectRatio>
          ) : fileType === 'pdf' ? (
            <iframe
              ref={iframeRef}
              src={document.url}
              className="w-full h-[60vh]"
              title="Document PDF"
              onError={handleImageError}
            />
          ) : (
            <div className="text-center p-4">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="mb-2">This file type cannot be previewed</p>
              <p className="text-sm text-muted-foreground mb-4">
                {document.file_type || 'Unknown file type'}
              </p>
              <Button
                variant="outline"
                className="text-blue-600 hover:text-blue-800"
                onClick={() => window.open(document.url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open document
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => window.open(document.url, '_blank')}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleClose} variant="default" size="sm">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
