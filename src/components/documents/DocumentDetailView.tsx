
import React, { useState, useEffect } from 'react';
import { Document } from './schemas/documentSchema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Trash2, ExternalLink, FileText, AlertTriangle, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DocumentDetailView = ({ document, open, onClose, onDelete }: DocumentDetailViewProps) => {
  const [viewError, setViewError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Reset state when document changes or dialog opens/closes
  useEffect(() => {
    setViewError(false);
    setLoadAttempted(false);
  }, [document, open]);
  
  // Force load attempt after component mount
  useEffect(() => {
    if (open && !loadAttempted && document) {
      setLoadAttempted(true);
      console.log('Document detail view - document loaded:', {
        id: document.document_id,
        fileName: document.file_name,
        fileType: document.file_type,
        url: document.url
      });
    }
  }, [open, loadAttempted, document]);

  if (!document) return null;

  const handleViewError = () => {
    console.log('Error loading document preview:', document.file_name);
    console.log('Document type:', document.file_type);
    setViewError(true);
  };

  // Determine the type of content for appropriate display
  const getContentType = () => {
    if (!document.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    return 'other';
  };

  const contentType = getContentType();

  // Handle closing dialog to avoid UI lockups
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document.file_name}</DialogTitle>
          <DialogDescription>
            {document.file_type || 'Document'} - Uploaded on {formatDate(document.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 border rounded-md h-[400px] overflow-auto">
          {viewError ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
              <p className="text-destructive font-semibold">Error loading document</p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
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
                className="max-w-full max-h-[350px] object-contain"
                onError={handleViewError}
              />
            </div>
          ) : contentType === 'pdf' ? (
            <iframe
              src={document.url}
              className="w-full h-full border-0"
              title={document.file_name}
              onError={handleViewError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="font-medium mb-1">Cannot preview this file type</p>
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
        
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={onDelete} size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} size="sm">
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(document.url, '_blank')}
              size="sm"
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

export default DocumentDetailView;
