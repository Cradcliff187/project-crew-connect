
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import DocumentViewer from '@/components/documents/DocumentViewer';

// Import refactored components
import DocumentUploadHeader from './document-upload/DocumentUploadHeader';
import DocumentUploadContent from './document-upload/DocumentUploadContent';
import DocumentUploadSheet from './document-upload/DocumentUploadSheet';
import { categorizeDocuments, filterDocumentsByType } from './document-upload/utils';

interface EstimateDocumentUploadProps {
  estimateItemId?: string;
  showLineItemDocuments?: boolean;
}

const EstimateDocumentUpload: React.FC<EstimateDocumentUploadProps> = ({
  estimateItemId,
  showLineItemDocuments = false
}) => {
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  
  const form = useFormContext<EstimateFormValues>();
  const documentIds = form.watch('estimate_documents') || [];
  const tempId = form.watch('temp_id');

  useEffect(() => {
    const fetchDocuments = async () => {
      if (documentIds.length === 0) {
        setAttachedDocuments([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .in('document_id', documentIds);

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to load attached documents',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setAttachedDocuments(data || []);
      setLoading(false);
    };

    fetchDocuments();
  }, [documentIds]);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    setIsDocumentUploadOpen(false);
    if (documentId) {
      const updatedDocumentIds = [...documentIds, documentId];
      form.setValue('estimate_documents', updatedDocumentIds);
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    const updatedDocumentIds = documentIds.filter(id => id !== documentId);
    form.setValue('estimate_documents', updatedDocumentIds);
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
  };

  const handleViewDocument = (document: Document) => {
    setViewDocument(document);
  };

  const closeViewer = () => {
    setViewDocument(null);
  };

  const handleOpenDocumentUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  };
  
  // Filter and categorize documents
  const filteredDocuments = filterDocumentsByType(attachedDocuments, showLineItemDocuments);
  const documentsByCategory = categorizeDocuments(filteredDocuments);
  
  // Determine title based on document type
  const title = showLineItemDocuments ? "Line Item Documents" : "Estimate Documents";

  return (
    <div className="space-y-4">
      <DocumentUploadHeader
        title={title}
        documentsCount={filteredDocuments.length}
        onOpenUpload={handleOpenDocumentUpload}
        isDocumentUploadOpen={isDocumentUploadOpen}
        setIsDocumentUploadOpen={setIsDocumentUploadOpen}
      >
        <DocumentUploadSheet
          isOpen={isDocumentUploadOpen}
          onClose={() => setIsDocumentUploadOpen(false)}
          tempId={tempId}
          entityType={showLineItemDocuments ? "ESTIMATE_ITEM" : "ESTIMATE"}
          itemId={showLineItemDocuments ? estimateItemId : undefined}
          onSuccess={handleDocumentUploadSuccess}
          title={showLineItemDocuments ? "Attach Document to Line Item" : "Attach Document to Estimate"}
        />
      </DocumentUploadHeader>
      
      <DocumentUploadContent
        documentsByCategory={documentsByCategory}
        filteredDocuments={filteredDocuments}
        onViewDocument={handleViewDocument}
        onRemoveDocument={handleRemoveDocument}
      />
      
      <DocumentViewer
        document={viewDocument}
        open={!!viewDocument}
        onOpenChange={(open) => !open && closeViewer()}
      />
    </div>
  );
};

export default EstimateDocumentUpload;
