
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Document } from './schemas/documentSchema';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileText, ExternalLink, Download, X, UploadCloud, Clock } from 'lucide-react';
import { format } from 'date-fns';
import DocumentVersionHistoryCard from './DocumentVersionHistoryCard';
import { useDocumentVersions } from './hooks/useDocumentVersions';
import { toast } from '@/hooks/use-toast';

interface DocumentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  title?: string;
  description?: string;
  onDelete?: () => void;
  showVersionHistory?: boolean;
}

const DocumentViewerDialog = ({
  open,
  onOpenChange,
  document,
  title,
  description,
  onDelete,
  showVersionHistory = true
}: DocumentViewerDialogProps) => {
  const [error, setError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [showUploadVersion, setShowUploadVersion] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const mountedRef = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { 
    documentVersions, 
    loading: loadingVersions, 
    createNewVersion, 
    refetchVersions 
  } = useDocumentVersions(document?.document_id);

  // Handle component unmounting
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      cleanupIframe();
    };
  }, []);

  // Reset state when document changes or dialog opens/closes
  useEffect(() => {
    if (mountedRef.current) {
      setError(false);
      setLoadAttempted(false);
      setShowUploadVersion(false);
      setFile(null);
      setNotes('');
    }
    
    // When dialog is closed, perform additional cleanup
    if (!open) {
      cleanupIframe();
    }
  }, [document, open]);
  
  // Force load attempt after component mount
  useEffect(() => {
    if (open && !loadAttempted && mountedRef.current) {
      setLoadAttempted(true);
    }
  }, [open, loadAttempted]);

  // Log document info for debugging
  useEffect(() => {
    if (document && open) {
      console.log('Viewing document:', {
        id: document.document_id,
        fileName: document.file_name,
        fileType: document.file_type,
        url: document.url
      });
    }
  }, [document, open]);

  // Helper function to clean up iframe
  const cleanupIframe = () => {
    if (iframeRef.current) {
      try {
        // Clear src to stop any ongoing loads
        iframeRef.current.src = 'about:blank';
      } catch (e) {
        console.log('Error cleaning up iframe:', e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadVersion = async () => {
    if (!file || !document) return;
    
    try {
      const success = await createNewVersion(file, notes || undefined);
      
      if (success) {
        toast({
          title: 'New version uploaded',
          description: 'Document version has been created successfully',
        });
        
        setShowUploadVersion(false);
        setFile(null);
        setNotes('');
        
        // Refetch versions to update the UI
        await refetchVersions();
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to create new document version',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error uploading new version:', err);
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading the new version',
        variant: 'destructive',
      });
    }
  };

  const handleSelectVersion = (selectedDoc: Document) => {
    if (selectedDoc.url) {
      window.open(selectedDoc.url, '_blank');
    }
  };

  if (!document) return null;

  // Check file type to determine display method
  const getFileType = () => {
    if (!document.file_type) return 'unknown';
    
    const fileType = document.file_type.toLowerCase();
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('doc')) return 'word';
    if (fileType.includes('xls')) return 'excel';
    return 'other';
  };

  const handleImageError = () => {
    if (mountedRef.current) {
      console.log('Error loading document:', document.url);
      console.log('Document type:', document.file_type);
      setError(true);
    }
  };

  const fileType = getFileType();

  // Format file size
  const formatFileSize = (bytes: number | null | undefined): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle closing dialog explicitly to avoid UI lockups
  const handleClose = () => {
    if (mountedRef.current) {
      cleanupIframe();
      
      // Small delay to ensure cleanup happens before dialog state changes
      setTimeout(() => {
        if (mountedRef.current) {
          onOpenChange(false);
        }
      }, 50);
    }
  };

  const dialogTitle = title || `Document: ${document.file_name}`;
  const dialogDescription = description || (document.category 
    ? `${document.category.replace(/_/g, ' ')} document` 
    : `${document.file_type || 'Document'} preview`);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <DialogTitle className="text-lg">{dialogTitle}</DialogTitle>
            <DialogDescription className="capitalize">{dialogDescription}</DialogDescription>
          </div>
          
          {!showUploadVersion && (
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUploadVersion(true)}
              >
                <UploadCloud className="h-4 w-4 mr-2" />
                Upload New Version
              </Button>
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={onDelete}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </DialogHeader>
        <Separator />
        
        {showUploadVersion ? (
          <div className="p-4 space-y-4">
            <h3 className="text-base font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
              Upload New Version
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  New File
                </label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#0485ea]/10 file:text-[#0485ea]
                    hover:file:bg-[#0485ea]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Version Notes
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 min-h-[80px]"
                  placeholder="Describe what changed in this version..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadVersion(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadVersion}
                  disabled={!file}
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  Upload Version
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 overflow-hidden">
            {/* Main document preview */}
            <div className="md:col-span-2 flex flex-col min-h-[50vh]">
              <div className="flex-1 overflow-auto border rounded-md bg-gray-50">
                {error ? (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                    <p className="text-red-600 mb-2 font-semibold">Error loading document</p>
                    <p className="text-sm text-gray-500 mb-4">
                      The document could not be loaded directly in this view.
                    </p>
                    <Button
                      variant="outline"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => document.url && window.open(document.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in new tab
                    </Button>
                  </div>
                ) : fileType === 'image' ? (
                  <div className="h-full flex items-center justify-center p-2">
                    <img
                      src={document.url || ''}
                      alt="Document"
                      className="max-w-full max-h-full object-contain"
                      onError={handleImageError}
                    />
                  </div>
                ) : fileType === 'pdf' ? (
                  <iframe
                    ref={iframeRef}
                    src={document.url || ''}
                    className="w-full h-full"
                    title="Document PDF"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="mb-2 font-medium">This file type cannot be previewed</p>
                    <p className="text-sm text-gray-500 mb-4">
                      {document.file_type || 'Unknown file type'}
                    </p>
                    <Button
                      variant="outline"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => document.url && window.open(document.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open document
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Document metadata */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
                <div className="mt-4">
                  <p className="text-gray-500">Notes</p>
                  <p className="text-sm border rounded-md p-2 mt-1 bg-gray-50">
                    {document.notes}
                  </p>
                </div>
              )}
            </div>
            
            {/* Version history sidebar */}
            {showVersionHistory && documentVersions.length > 0 && (
              <div className="md:col-span-1 overflow-hidden flex flex-col">
                <DocumentVersionHistoryCard 
                  documents={documentVersions}
                  currentVersion={document.version || 1}
                  onVersionSelect={handleSelectVersion}
                />
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="px-4 pb-4 pt-2">
          <Button onClick={handleClose} variant="ghost" size="sm">
            Close
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => document.url && window.open(document.url, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerDialog;
