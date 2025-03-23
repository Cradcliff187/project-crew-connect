
import { useState } from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import { fetchDocumentWithUrl } from '@/components/documents/services/DocumentFetcher';

export interface UseDocumentViewerOptions {
  onView?: (document: Document) => void;
  onClose?: () => void;
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
}

export function useDocumentViewer(options: UseDocumentViewerOptions = {}) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const viewDocument = async (documentId: string) => {
    try {
      setIsLoading(true);
      
      const document = await fetchDocumentWithUrl(documentId, {
        imageOptions: options.imageOptions || {
          width: 1200,
          height: 1200,
          quality: 90
        }
      });
      
      if (document) {
        setCurrentDocument(document);
        setIsViewerOpen(true);
        
        if (options.onView) {
          options.onView(document);
        }
      }
    } catch (error) {
      console.error('Error viewing document:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeViewer = () => {
    setIsViewerOpen(false);
    setCurrentDocument(null);
    
    if (options.onClose) {
      options.onClose();
    }
  };
  
  return {
    viewDocument,
    closeViewer,
    isViewerOpen,
    setIsViewerOpen,
    currentDocument,
    isLoading
  };
}
