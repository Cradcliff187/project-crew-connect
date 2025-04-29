import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, X, FileText } from 'lucide-react';
// Removed import of WorkOrderDocument
import { Database } from '@/integrations/supabase/types';
import { formatDate, formatFileSize, cn } from '@/lib/utils';

// Use generated type alias
type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface DocumentViewerProps {
  document: DocumentRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  if (!document) return null;

  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';

  const handleDownload = () => {
    // TODO: Implement secure download using Supabase storage API
    // For now, just log or show alert if URL is missing
    if (!document?.storage_path) {
      console.warn('Download attempted but storage_path is missing.');
      alert('Cannot download file: Path is missing.');
      return;
    }
    console.log('Download initiated for:', document.storage_path);
    alert('Download functionality not fully implemented yet.');
    // Example (needs supabase client instance and error handling):
    // const { data, error } = await supabase.storage.from('documents') // Assuming 'documents' bucket
    //   .download(document.storage_path);
    // if (data) {
    //   const url = URL.createObjectURL(data);
    //   const a = document.createElement('a');
    //   a.href = url;
    //   a.download = document.file_name || 'download';
    //   document.body.appendChild(a);
    //   a.click();
    //   document.body.removeChild(a);
    //   URL.revokeObjectURL(url);
    // }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            {/* Use text-primary */}
            <DialogTitle className="text-lg font-semibold text-primary">
              {document.file_name || 'Untitled'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground mt-2">
            {document.file_type && <div>Type: {document.file_type}</div>}
            {document.file_size != null && <div>Size: {formatFileSize(document.file_size)}</div>}
            {document.created_at && <div>Uploaded: {formatDate(document.created_at)}</div>}
            {document.version != null && <div>Version: {document.version}</div>}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-50 min-h-[400px] flex items-center justify-center">
          {/* TODO: Get public URL for preview using storage_path */}
          {isImage && document.storage_path ? (
            <img
              // src={document.url} // Replace with dynamically generated URL if possible
              src={`/placeholder-preview/${document.storage_path}`}
              alt={document.file_name || 'Preview'}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : isPdf && document.storage_path ? (
            <iframe
              // src={document.url} // Replace with dynamically generated URL if possible
              src={`/placeholder-preview/${document.storage_path}`}
              title={document.file_name || 'Preview'}
              className="w-full h-full min-h-[500px]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Preview not available</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                This file type can't be previewed. Please download the file to view its contents.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t">
          {/* Use primary button variant */}
          <Button onClick={handleDownload} disabled={!document.storage_path}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
