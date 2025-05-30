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

      // Fetch additional context based on entity type
      const additionalInfo: any = {};

      if (data.entity_type === 'PROJECT' && data.entity_id) {
        const { data: projectData } = await supabase
          .from('projects')
          .select('projectid, projectname, customerid')
          .eq('projectid', data.entity_id)
          .single();

        if (projectData) {
          additionalInfo.project_name = projectData.projectname;
          additionalInfo.customer_id = projectData.customerid;
        }
      } else if (data.entity_type === 'EXPENSE' && data.entity_id) {
        const { data: expenseData } = await supabase
          .from('expenses')
          .select('id, amount, expense_date, vendor_id, description')
          .eq('id', data.entity_id)
          .single();

        if (expenseData) {
          additionalInfo.expense_info = expenseData;
        }
      }

      // Generate a signed URL for the document (expires in 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('construction_documents')
        .createSignedUrl(data.storage_path, 3600); // 1 hour expiration

      if (urlError) {
        console.error('Error generating signed URL:', urlError);
        throw urlError;
      }

      // Combine the data
      const documentWithUrl: Document = {
        ...data,
        url: urlData.signedUrl,
        ...additionalInfo,
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
