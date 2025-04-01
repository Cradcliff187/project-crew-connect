
import { useState, useCallback } from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import { fetchDocumentWithUrl } from '@/components/documents/services/DocumentFetcher';
import { toast } from '@/hooks/use-toast';

export interface UseDocumentViewerOptions {
  onView?: (document: Document) => void;
  onClose?: () => void;
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'png' | 'jpeg';
  };
  expiresIn?: number; // URL expiration time in seconds
}

export function useDocumentViewer(options: UseDocumentViewerOptions = {}) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const viewDocument = async (documentId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Viewing document with ID:', documentId);
      
      const document = await fetchDocumentWithUrl(documentId, {
        imageOptions: options.imageOptions || {
          width: 1200,
          height: 1200,
          quality: 90,
          format: 'webp'
        },
        expiresIn: options.expiresIn || 300 // Default to 5 minutes
      });
      
      if (document) {
        setCurrentDocument(document);
        setIsViewerOpen(true);
        
        if (options.onView) {
          options.onView(document);
        }
        
        console.log('Document loaded successfully:', document.file_name);
      } else {
        setError('Could not load document');
        toast({
          title: 'Error',
          description: 'Could not load document',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);
      setError(error.message || 'An error occurred while loading the document');
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while loading the document',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    
    // Use timeout to ensure the dialog has time to close properly
    setTimeout(() => {
      setCurrentDocument(null);
      setError(null);
      
      if (options.onClose) {
        options.onClose();
      }
    }, 100);
  }, [options]);
  
  return {
    viewDocument,
    closeViewer,
    isViewerOpen,
    setIsViewerOpen: (isOpen: boolean) => {
      if (!isOpen) {
        closeViewer();
      } else {
        setIsViewerOpen(true);
      }
    },
    currentDocument,
    isLoading,
    error
  };
}
