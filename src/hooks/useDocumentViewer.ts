
import { useState } from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import { supabase } from '@/integrations/supabase/client';

interface DocumentViewerOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'png' | 'jpeg';
  };
  onClose?: () => void;
}

export function useDocumentViewer(options?: DocumentViewerOptions) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const viewDocument = async (documentId: string) => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch document data
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('document_id', documentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (!data) {
        setError('Document not found');
        return;
      }
      
      // Get the URL for the document
      const { data: urlData } = await supabase.storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      // Combine the data
      const documentWithUrl: Document = {
        ...data,
        url: urlData.publicUrl,
      };
      
      setCurrentDocument(documentWithUrl);
      setIsViewerOpen(true);
    } catch (err: any) {
      console.error('Error fetching document:', err);
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };
  
  const closeViewer = () => {
    setIsViewerOpen(false);
    if (options?.onClose) {
      options.onClose();
    }
  };
  
  return {
    viewDocument,
    closeViewer,
    isViewerOpen,
    setIsViewerOpen,
    currentDocument,
    loading,
    isLoading: loading,
    error,
  };
}
