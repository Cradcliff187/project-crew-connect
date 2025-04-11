
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Document } from './schemas/documentSchema';
import { getCategoryDisplayName, getCategoryColorClass } from './utils/DocumentCategoryHelper';
import { formatDate, formatFileSize } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, External, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!document || !document.url) {
      toast({
        title: "Error",
        description: "Download URL not available",
        variant: "destructive"
      });
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = document.url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
      
      toast({
        title: "Download started",
        description: `Downloading ${document.file_name}`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (document?.url) {
      window.open(document.url, '_blank');
    }
  };
  
  const copyLinkToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (document?.url) {
      navigator.clipboard.writeText(document.url)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Document link copied to clipboard"
          });
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          toast({
            title: "Copy failed",
            description: "Could not copy link to clipboard",
            variant: "destructive"
          });
        });
    }
  };
  
  // Determine if document is an image, PDF, or other type
  const isImage = document?.file_type?.startsWith('image/');
  const isPdf = document?.file_type === 'application/pdf';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-montserrat">
            <FileText className="h-5 w-5 text-[#0485ea]" />
            {document?.file_name || 'Document Viewer'}
          </DialogTitle>
          
          {document && (
            <div className="flex flex-wrap gap-2 mt-2">
              {document.category && (
                <Badge variant="outline" className={`${getCategoryColorClass(document.category)} text-white`}>
                  {getCategoryDisplayName(document.category)}
                </Badge>
              )}
              {document.tags && document.tags.length > 0 && document.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-auto min-h-[50vh]">
          {isImage && document?.url && (
            <div className="h-full flex items-center justify-center p-4 bg-slate-50">
              <img 
                src={document.url} 
                alt={document.file_name} 
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>
          )}
          
          {isPdf && document?.url && (
            <iframe
              src={`${document.url}#toolbar=0&navpanes=0`}
              title={document.file_name}
              className="w-full h-[65vh] border-0"
            />
          )}
          
          {!isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <FileText className="h-16 w-16 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium">Preview not available</h3>
              <p className="text-sm text-slate-500">
                This file type cannot be previewed directly. You can download the file to view it.
              </p>
            </div>
          )}
        </div>
        
        {document && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
              <div>
                <p className="font-medium">File Info</p>
                <p>Type: {document.file_type || 'Unknown'}</p>
                <p>Size: {formatFileSize(document.file_size || 0)}</p>
              </div>
              <div>
                <p className="font-medium">Document Details</p>
                <p>Created: {formatDate(document.created_at)}</p>
                {document.updated_at && <p>Updated: {formatDate(document.updated_at)}</p>}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading || !document.url}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenExternal}
                  disabled={!document.url}
                >
                  <External className="h-4 w-4 mr-1" />
                  Open
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyLinkToClipboard}
                  disabled={!document.url}
                >
                  <Clipboard className="h-4 w-4 mr-1" />
                  Copy Link
                </Button>
              </div>
            </div>
            
            {document.notes && (
              <div className="mt-4">
                <p className="font-medium">Notes:</p>
                <p className="text-sm text-slate-600">{document.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
