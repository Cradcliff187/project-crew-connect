
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { WorkOrderDocument } from './types';
import { useState } from 'react';

interface DocumentViewerProps {
  document: WorkOrderDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    console.log('Error loading document:', document?.url);
    setError(true);
  };
  
  const determineDisplayType = () => {
    if (!document?.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    return 'unknown';
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document?.file_name}</DialogTitle>
        </DialogHeader>
        {document && (
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
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-3">Preview not available</p>
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
