
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, File, X } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { format } from 'date-fns';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  title?: string;
  description?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  open,
  onOpenChange,
  onDelete,
  title,
  description
}) => {
  if (!document) {
    return null;
  }

  const isImage = document.file_type?.startsWith('image/');
  const isPDF = document.file_type === 'application/pdf';
  
  // Format the file size
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const dialogTitle = title || `Document: ${document.file_name}`;
  const dialogDescription = description || (document.category 
    ? `${document.category.replace(/_/g, ' ')} document` 
    : `${document.file_type || 'Document'} preview`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isImage ? (
              <Image className="h-5 w-5 text-blue-500" />
            ) : isPDF ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : (
              <File className="h-5 w-5 text-gray-500" />
            )}
            {dialogTitle}
          </DialogTitle>
          {description && <p className="text-sm text-gray-500">{dialogDescription}</p>}
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden min-h-[60vh]">
          {isImage && document.url ? (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-md overflow-auto">
              <img 
                src={document.url} 
                alt={document.file_name || 'Document preview'} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : isPDF && document.url ? (
            <iframe 
              src={document.url} 
              className="w-full h-full rounded-md"
              title={document.file_name || 'PDF Document'}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-md">
              <div className="text-center p-6">
                <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Preview not available for this file type
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {document.file_type || 'Unknown file type'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">File Type</p>
              <p>{document.file_type || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500">Size</p>
              <p>{formatFileSize(document.file_size)}</p>
            </div>
            <div>
              <p className="text-gray-500">Uploaded</p>
              <p>
                {document.created_at 
                  ? format(new Date(document.created_at), 'MMM d, yyyy h:mm a') 
                  : 'Unknown date'}
              </p>
            </div>
            {document.category && (
              <div>
                <p className="text-gray-500">Category</p>
                <p className="capitalize">
                  {document.category.replace(/_/g, ' ')}
                </p>
              </div>
            )}
          </div>
          
          {document.notes && (
            <div className="mt-2">
              <p className="text-gray-500">Notes</p>
              <p className="text-sm">{document.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between mt-4">
          {onDelete && (
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={onDelete}
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          
          <Button 
            className="ml-auto bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => {
              if (document.url) {
                window.open(document.url, '_blank');
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
