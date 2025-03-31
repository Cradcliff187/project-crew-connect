
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X, Download, FileType, FileText, Image as ImageIcon, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase, DOCUMENTS_BUCKET_ID } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface DocumentViewerProps {
  document: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, open, onOpenChange }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset error state when document changes
    setError(null);
    
    // Generate download URL on document load
    if (document?.storage_path) {
      generateDownloadUrl();
    }
  }, [document]);
  
  const generateDownloadUrl = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from(DOCUMENTS_BUCKET_ID)
        .createSignedUrl(document.storage_path, 300, { download: true });
        
      if (error) throw error;
      setDownloadUrl(data.signedUrl);
    } catch (error: any) {
      console.error('Error generating download URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate download link',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      generateDownloadUrl().then(() => {
        if (downloadUrl) window.open(downloadUrl, '_blank');
      });
    }
  };
  
  const handleError = () => {
    setError('Failed to load document preview. Try downloading it instead.');
  };
  
  const determineDisplayType = () => {
    if (!document) return 'unknown';
    
    const fileType = document.file_type?.toLowerCase() || '';
    
    if (fileType.includes('image/')) {
      return 'image';
    } else if (fileType === 'application/pdf') {
      return 'pdf';
    } else {
      return 'other';
    }
  };
  
  const getDocumentIcon = () => {
    switch (determineDisplayType()) {
      case 'image':
        return <ImageIcon className="h-10 w-10 text-gray-400" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-400" />;
      default:
        return <File className="h-10 w-10 text-blue-400" />;
    }
  };
  
  const getTimeSinceUpload = () => {
    if (!document?.created_at) return '';
    try {
      return formatDistanceToNow(new Date(document.created_at), { addSuffix: true });
    } catch (err) {
      return '';
    }
  };
  
  if (!document) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <DialogTitle className="text-xl font-semibold">{document.file_name}</DialogTitle>
              <div className="flex items-center mt-1 space-x-2">
                <FileType className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">{document.file_type || 'Unknown type'}</span>
                {document.category && (
                  <Badge variant="outline" className="ml-2">
                    {document.category}
                  </Badge>
                )}
                <span className="text-xs text-gray-400">Uploaded {getTimeSinceUpload()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
          {error ? (
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="mb-4">
                {getDocumentIcon()}
              </div>
              <p className="text-red-500 mb-2">{error}</p>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </div>
          ) : (
            <div className="h-full w-full">
              {determineDisplayType() === 'image' ? (
                <img
                  src={document.url || ''}
                  alt={document.file_name || 'Document preview'}
                  className="w-full h-full object-contain"
                  onError={handleError}
                  loading="lazy"
                />
              ) : determineDisplayType() === 'pdf' ? (
                <iframe
                  src={document.url || ''}
                  className="w-full h-full"
                  title={document.file_name || 'PDF document'}
                  onError={handleError}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <div className="mb-4">
                    {getDocumentIcon()}
                  </div>
                  <p className="text-gray-500 mb-2">Preview not available for this file type</p>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
