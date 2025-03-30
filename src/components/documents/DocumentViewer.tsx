
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileIcon, FileTextIcon, FileImageIcon, Loader2 } from 'lucide-react';
import { DocumentViewerProps } from './schemas/documentSchema';

// Helper function to get icon based on file type
const getDocumentIcon = (fileType?: string) => {
  if (!fileType) return <FileIcon className="h-4 w-4" />;
  
  if (fileType?.includes('image')) {
    return <FileImageIcon className="h-4 w-4" />;
  } else if (fileType?.includes('pdf')) {
    return <FileTextIcon className="h-4 w-4" />;
  }
  
  return <FileIcon className="h-4 w-4" />;
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onOpenChange,
  document,
  isLoading = false
}) => {
  // Render correct viewer based on file type
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea] mb-2" />
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        </div>
      );
    }
    
    if (!document) {
      return (
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-muted-foreground">No document selected</p>
        </div>
      );
    }
    
    if (document.file_type?.includes('image')) {
      return (
        <div className="flex justify-center overflow-auto max-h-[70vh]">
          <img 
            src={document.url} 
            alt={document.file_name}
            className="max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMjJDNi40NzcgMjIgMiAxNy41MjMgMiAxMkMyIDYuNDc3IDYuNDc3IDIgMTIgMkMxNy41MjMgMiAyMiA2LjQ3NyAyMiAxMkMyMiAxNy41MjMgMTcuNTIzIDIyIDEyIDIyWk0xMiAyMEMxNi40MTggMjAgMjAgMTYuNDE4IDIwIDEyQzIwIDcuNTgyIDE2LjQxOCA0IDEyIDRDNy41ODIgNCA0IDcuNTgyIDQgMTJDNCAxNi40MTggNy41ODIgMjAgMTIgMjBaTTExIDcuNUgxM1Y5LjVIMTFWNy41Wk0xMSAxMS41SDEzVjE2LjVIMTFWMTEuNVoiIGZpbGw9ImN1cnJlbnRDb2xvciIvPjwvc3ZnPg==';
              e.currentTarget.classList.add('error-image');
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="flex justify-center overflow-hidden">
        <iframe
          src={`${document.url}#toolbar=1`}
          className="w-full h-[70vh] border rounded"
          title={document.file_name}
        />
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {document?.file_type && getDocumentIcon(document.file_type)}
            <span>{document?.file_name}</span>
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
