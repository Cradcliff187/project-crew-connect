
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { Document, DocumentViewData } from '@/components/documents/schemas/documentSchema';

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
      console.log(`Fetching document details for ID: ${documentId}`);
      
      // Fetch document data - explicitly list the columns we need
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
      
      console.log('Document data retrieved:', data);
      
      // Generate signed URL with appropriate options based on file type
      let urlOptions = {};
      
      // For images, add transformation options if provided
      if (data.file_type && data.file_type.startsWith('image/') && options?.imageOptions) {
        urlOptions = {
          transform: {
            width: options.imageOptions.width,
            height: options.imageOptions.height,
            quality: options.imageOptions.quality || 80
          }
        };
      }
      
      console.log(`Creating signed URL for: ${data.storage_path}`);
      
      // Generate the signed URL with a longer expiration for document viewing
      const { data: urlData, error: urlError } = await supabase.storage
        .from('construction_documents')
        .createSignedUrl(data.storage_path, 900, urlOptions); // 15 minutes expiration
      
      if (urlError) {
        throw urlError;
      }
      
      if (!urlData || !urlData.signedUrl) {
        throw new Error('Failed to generate document URL');
      }
      
      console.log('Signed URL generated successfully');
      
      // Log access to document
      await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          action: 'VIEW'
        })
        .then(result => {
          if (result.error) {
            console.warn('Failed to log document access:', result.error);
          }
        });
      
      // Set document and open viewer
      setCurrentDocument({
        document_id: data.document_id,
        file_name: data.file_name,
        file_type: data.file_type || '',
        url: urlData.signedUrl
      });
      
      setIsViewerOpen(true);
    } catch (error: any) {
      console.error('Error viewing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to view document: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
      
      // Return the error so callers can handle it
      throw error;
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
