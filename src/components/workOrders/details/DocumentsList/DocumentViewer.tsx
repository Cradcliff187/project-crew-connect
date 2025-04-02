
import React from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText } from 'lucide-react';
import { WorkOrderDocument } from './types';
import { formatDate, formatFileSize } from '@/lib/utils';

interface DocumentViewerProps {
  document: WorkOrderDocument | null;
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
  const isPdf = document.file_type === 'application/pdf';
  
  const handleDownload = () => {
    if (!document?.url) return;
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = document.url;
    a.download = document.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-[#0485ea]">
              {document.file_name}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mt-2">
            <div>Type: {document.file_type}</div>
            <div>Size: {formatFileSize(document.file_size || 0)}</div>
            <div>Uploaded: {formatDate(document.created_at)}</div>
            {document.version && <div>Version: {document.version}</div>}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto bg-gray-50 min-h-[400px] flex items-center justify-center">
          {isImage ? (
            <img 
              src={document.url} 
              alt={document.file_name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : isPdf ? (
            <iframe 
              src={document.url}
              title={document.file_name}
              className="w-full h-full min-h-[500px]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Preview not available</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                This file type can't be previewed. Please download the file to view its contents.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="p-4 border-t">
          <Button
            onClick={handleDownload}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
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
