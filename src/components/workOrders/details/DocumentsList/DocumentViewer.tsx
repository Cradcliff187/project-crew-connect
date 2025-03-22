
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { WorkOrderDocument } from './types';

interface DocumentViewerProps {
  document: WorkOrderDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer = ({ document, open, onOpenChange }: DocumentViewerProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{document?.file_name}</DialogTitle>
        </DialogHeader>
        {document && (
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden h-[400px]">
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
                asChild
              >
                <a href={document.url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
