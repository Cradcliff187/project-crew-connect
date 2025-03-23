
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, FileText, ExternalLink, File, FileArchive } from 'lucide-react';
import { WorkOrderDocument } from './types';
import { useState, useEffect } from 'react';

interface DocumentViewerProps {
  document: WorkOrderDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  const [error, setError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  
  // Reset error state when document changes
  useEffect(() => {
    setError(false);
    setLoadAttempted(false);
  }, [document]);
  
  const handleError = () => {
    console.log('Error loading document:', document?.url);
    console.log('Document type:', document?.file_type);
    setError(true);
  };
  
  const getFileIcon = () => {
    if (!document?.file_type) return <FileText className="h-12 w-12 text-muted-foreground" />;
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.includes('pdf')) return <FileText className="h-12 w-12 text-red-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-12 w-12 text-blue-500" />;
    if (fileType.includes('excel') || fileType.includes('sheet')) return <FileText className="h-12 w-12 text-green-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <FileArchive className="h-12 w-12 text-yellow-500" />;
    return <File className="h-12 w-12 text-muted-foreground" />;
  };
  
  const determineDisplayType = () => {
    if (!document?.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    return 'unknown';
  };
  
  // If the document is null, don't render anything
  if (!document) return null;
  
  // Force load attempt after component mount if no error has occurred
  useEffect(() => {
    if (open && !loadAttempted && !error) {
      setLoadAttempted(true);
    }
  }, [open, loadAttempted, error]);
  
  // Log document info for debugging
  console.log('Viewing document:', {
    id: document.document_id,
    name: document.file_name,
    type: document.file_type,
    url: document.url
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document?.file_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden h-[400px]">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
                <p className="text-destructive font-medium mb-1">Error loading document</p>
                <p className="text-sm text-muted-foreground mb-3 text-center">
                  The document could not be loaded directly in this preview.
                </p>
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.open(document.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in new tab
                  </Button>
                </div>
              </div>
            ) : determineDisplayType() === 'image' ? (
              <img
                src={document.url}
                alt={document.file_name || 'Document preview'}
                className="w-full h-full object-contain"
                onError={handleError}
              />
            ) : determineDisplayType() === 'pdf' ? (
              <iframe
                src={document.url}
                title={document.file_name || 'PDF document'}
                className="w-full h-full"
                onError={handleError}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                {getFileIcon()}
                <p className="text-muted-foreground mt-3 mb-2">Preview not available for this file type</p>
                <p className="text-xs text-muted-foreground mb-3">
                  {document.file_type || 'Unknown file type'}
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.open(document.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open document
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button 
              variant="outline"
              className="text-[#0485ea]"
              onClick={() => window.open(document.url, '_blank')}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
