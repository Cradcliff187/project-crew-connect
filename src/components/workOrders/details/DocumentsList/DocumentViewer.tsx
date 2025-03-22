
import React from 'react';
import { DocumentBase } from '@/components/documents/types/documentTypes';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface DocumentViewerProps {
  document: DocumentBase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  if (!document || !document.url) {
    return <div>Document not available</div>;
  }

  // Handle document download
  const handleDownload = () => {
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden" style={{ height: '400px' }}>
        {document.file_type?.startsWith('image/') ? (
          <img
            src={document.url}
            alt={document.file_name}
            className="w-full h-full object-contain"
          />
        ) : document.file_type?.includes('pdf') ? (
          <iframe
            src={document.url}
            title={document.file_name}
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p>Preview not available</p>
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
          onClick={handleDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default DocumentViewer;
