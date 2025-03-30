
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { DocumentViewData } from '@/components/documents/schemas/documentSchema';

interface DocumentViewerOptions {
  imageOptions?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  onClose?: () => void;
}

export const useDocumentViewer = (options?: DocumentViewerOptions) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<DocumentViewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const viewDocument = async (documentId: string) => {
    setIsLoading(true);
    
    try {
      // Fetch document data
      const { data, error } = await supabase
        .from('documents')
        .select('document_id, file_name, file_type, storage_path')
        .eq('document_id', documentId)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Document not found');
      }
      
      // Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from('construction_documents')
        .getPublicUrl(data.storage_path);
      
      // Log access to document
      await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          action: 'VIEW'
        });
      
      // Set document and open viewer
      setCurrentDocument({
        document_id: data.document_id,
        file_name: data.file_name,
        file_type: data.file_type || '',
        url: publicUrl
      });
      
      setIsViewerOpen(true);
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to view document: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
    isLoading
  };
};
