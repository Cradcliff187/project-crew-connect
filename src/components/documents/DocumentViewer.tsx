
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, FileUp, X } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadNewVersion?: () => void;
  showVersionUpload?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  onUploadNewVersion,
  showVersionUpload = false
}) => {
  if (!document) return null;

  const isPdf = document.file_type?.includes('pdf');
  const isImage = document.file_type?.includes('image');
  const created = document.created_at ? formatDistanceToNow(new Date(document.created_at), { addSuffix: true }) : '';
  
  // Format file size
  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-base truncate max-w-md">{document.file_name}</DialogTitle>
          <div className="flex gap-2">
            {document.url && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <a href={document.url} download={document.file_name} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </a>
                </Button>
              </>
            )}
            {showVersionUpload && onUploadNewVersion && (
              <Button variant="outline" size="sm" onClick={onUploadNewVersion}>
                <FileUp className="h-4 w-4 mr-1" />
                New Version
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto h-[50vh] border rounded-md bg-gray-50">
              {isPdf && document.url ? (
                <iframe 
                  src={`${document.url}#toolbar=0`} 
                  className="w-full h-full" 
                  title={document.file_name}
                />
              ) : isImage && document.url ? (
                <div className="flex items-center justify-center h-full p-4">
                  <img 
                    src={document.url} 
                    alt={document.file_name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">Preview not available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This file type doesn't support preview. Please download or open to view.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Document Details</h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span> {document.file_type || 'Unknown'}
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span> {formatFileSize(document.file_size)}
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span> {created}
                </div>
                {document.version && (
                  <div>
                    <span className="text-muted-foreground">Version:</span> {document.version}
                  </div>
                )}
                {document.category && (
                  <div>
                    <span className="text-muted-foreground">Category:</span> {document.category}
                  </div>
                )}
              </div>
              
              <Separator className="my-3" />
              
              {document.tags && document.tags.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {document.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {document.notes && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Notes</h4>
                  <p className="text-sm">{document.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
