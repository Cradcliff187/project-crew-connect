
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { Document, formatFileSize } from '@/services/documentService';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  onDownload
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  if (!document) return null;

  const isImage = document.file_type?.includes('image');
  const isPdf = document.file_type?.includes('pdf');
  const documentUrl = document.url;
  
  const handleOpenInNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };
  
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    
    if (documentUrl) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span className="truncate max-w-[600px]">{document.file_name}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenInNewTab} size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button variant="secondary" onClick={handleDownload} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            {document.file_type && `${document.file_type} • `}
            {document.file_size && formatFileSize(document.file_size)}
            {document.created_at && ` • Uploaded on ${new Date(document.created_at).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-[400px] overflow-auto bg-gray-100 rounded-md">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive text-center">
                Failed to load document: {error}
                <br />
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={handleOpenInNewTab}
                >
                  Try opening in a new tab
                </Button>
              </p>
            </div>
          )}
          
          {isImage && documentUrl && (
            <img
              src={documentUrl}
              alt={document.file_name}
              className="w-full h-auto object-contain"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError('Failed to load image');
              }}
              style={{ display: loading ? 'none' : 'block' }}
            />
          )}
          
          {isPdf && documentUrl && (
            <iframe
              src={`${documentUrl}#toolbar=0`}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError('Failed to load PDF');
              }}
              style={{ display: loading ? 'none' : 'block' }}
            />
          )}
          
          {!isImage && !isPdf && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <p className="text-center">
                This file type cannot be previewed.
                <br />
                Please download the file to view it.
              </p>
              <Button 
                className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]" 
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
