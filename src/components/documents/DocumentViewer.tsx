
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, AlertTriangle, X } from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  if (!document) return null;

  const getFileType = () => {
    if (!document.file_type) return 'unknown';
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    return 'other';
  };

  const fileType = getFileType();
  const fileName = document.file_name || 'Document';
  const fileSize = document.file_size ? formatBytes(document.file_size) : 'Unknown size';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {fileName}
          </DialogTitle>
          <DialogDescription>
            {document.file_type || 'Document'} • {fileSize}
          </DialogDescription>
        </DialogHeader>
        
        <div className="min-h-[60vh] flex items-center justify-center bg-muted/20 rounded-md overflow-hidden">
          {fileType === 'image' ? (
            <img
              src={document.url}
              alt={fileName}
              className="max-h-[60vh] object-contain"
              onError={() => console.error('Error loading image')}
            />
          ) : fileType === 'pdf' ? (
            <iframe
              src={`${document.url}#toolbar=1`}
              className="w-full h-[60vh]"
              title={fileName}
            />
          ) : (
            <div className="text-center p-4">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <p className="mb-2 font-medium">This file type cannot be previewed</p>
              <p className="text-sm text-muted-foreground mb-4">
                {document.file_type || 'Unknown file type'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between mt-4">
          <div>
            {document.category && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                {document.category}
              </span>
            )}
            {document.created_at && (
              <span className="text-xs text-muted-foreground ml-2">
                Added {new Date(document.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => window.open(document.url, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#0485ea] text-white hover:bg-[#0373ce]"
              onClick={() => window.open(document.url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
