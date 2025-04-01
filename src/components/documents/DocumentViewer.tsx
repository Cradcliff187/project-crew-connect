
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { Download, X, AlertCircle, Download as DownloadIcon, File } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  // Reset loading state when document changes
  React.useEffect(() => {
    if (document && open) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [document, open]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Detect document type
  const isImage = document?.file_type?.startsWith('image/');
  const isPdf = document?.file_type === 'application/pdf';
  const isSupported = isImage || isPdf;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg truncate">
                {document?.file_name || 'Document Viewer'}
              </DialogTitle>
              {document && (
                <DialogDescription className="text-sm">
                  {new Date(document.created_at).toLocaleString()} · {document.file_type} · {(document.file_size || 0) / 1024 / 1024 < 1 ? `${Math.ceil((document.file_size || 0) / 1024)} KB` : `${((document.file_size || 0) / 1024 / 1024).toFixed(2)} MB`}
                </DialogDescription>
              )}
            </div>
            <div className="flex items-center gap-2">
              {document?.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={document.url} download={document.file_name} target="_blank" rel="noopener noreferrer">
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative bg-muted/30">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <File className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Loading document...</p>
              </div>
            </div>
          )}

          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="flex flex-col items-center gap-2 max-w-md text-center p-6">
                <AlertCircle className="h-12 w-12 text-destructive/80" />
                <h3 className="font-medium text-lg">Unable to preview this document</h3>
                <p className="text-sm text-muted-foreground">
                  This file type cannot be previewed in the browser. Try downloading it instead.
                </p>
                {document?.url && (
                  <Button variant="default" className="mt-2" asChild>
                    <a href={document.url} download={document.file_name} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          <ScrollArea className="h-[calc(90vh-120px)]">
            {document?.url && isImage && (
              <div className="flex items-center justify-center p-4">
                <img 
                  src={document.url} 
                  alt={document.file_name || 'Document preview'} 
                  className="max-w-full max-h-[calc(90vh-120px)] object-contain"
                  onLoad={handleLoad}
                  onError={handleError}
                />
              </div>
            )}

            {document?.url && isPdf && (
              <iframe
                ref={iframeRef}
                src={document.url}
                className="w-full h-[calc(90vh-120px)]"
                onLoad={handleLoad}
                onError={handleError}
              />
            )}

            {document?.url && !isSupported && (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center gap-4 text-center">
                  <File className="h-16 w-16 text-muted-foreground/50" />
                  <div>
                    <h3 className="font-medium text-lg">Preview not available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This file type ({document.file_type}) cannot be previewed in the browser.
                    </p>
                    <Button asChild>
                      <a href={document.url} download={document.file_name} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
