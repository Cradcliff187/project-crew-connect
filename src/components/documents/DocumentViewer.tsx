
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Document } from './schemas/documentSchema';
import { Download, FileText, FileImage, File } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
  if (!document) return null;
  
  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type?.includes('pdf');
  
  const getFileIcon = () => {
    if (isImage) return <FileImage className="h-8 w-8 text-blue-400" />;
    if (isPdf) return <FileText className="h-8 w-8 text-red-400" />;
    return <File className="h-8 w-8 text-gray-400" />;
  };
  
  const formatFileSize = (size?: number) => {
    if (!size) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon()}
            <span className="truncate">{document.file_name}</span>
          </DialogTitle>
          <DialogDescription>
            {formatDate(document.created_at || '')} - {formatFileSize(document.file_size)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-[50vh] bg-gray-50 rounded-md flex items-center justify-center">
          {isImage && document.file_url ? (
            <img 
              src={document.file_url} 
              alt={document.file_name} 
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : isPdf && document.file_url ? (
            <iframe
              src={document.file_url}
              className="w-full h-[60vh]"
              title={document.file_name}
            />
          ) : (
            <div className="text-center p-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Preview not available for this file type
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.open(document.file_url, '_blank')}
              >
                Open in new tab
              </Button>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {document.notes && (
              <p><strong>Notes:</strong> {document.notes}</p>
            )}
            {document.entity_type && (
              <p><strong>Associated with:</strong> {document.entity_type.toLowerCase()}</p>
            )}
          </div>
          <Button onClick={() => window.open(document.file_url, '_blank')}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
