import React from 'react';
import DocumentViewer from '@/components/documents/DocumentViewer';

// Import refactored components
import DocumentUploadHeader from './document-upload/DocumentUploadHeader';
import DocumentUploadContent from './document-upload/DocumentUploadContent';
import DocumentUploadSheet from './document-upload/DocumentUploadSheet';
import { useEstimateDocumentManager } from '../hooks/useEstimateDocumentManager';

interface EstimateDocumentUploadProps {
  estimateItemId?: string;
  showLineItemDocuments?: boolean;
}

const EstimateDocumentUpload: React.FC<EstimateDocumentUploadProps> = ({
  estimateItemId,
  showLineItemDocuments = false,
}) => {
  // Use our custom hook for all document management logic
  const {
    isDocumentUploadOpen,
    setIsDocumentUploadOpen,
    viewDocument,
    loading,
    tempId,
    filteredDocuments,
    documentsByCategory,
    title,
    handleDocumentUploadSuccess,
    handleRemoveDocument,
    handleViewDocument,
    closeViewer,
    handleOpenDocumentUpload,
    entityType,
    itemId,
  } = useEstimateDocumentManager({
    estimateItemId,
    showLineItemDocuments,
  });

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
          entityType={entityType}
          itemId={itemId}
          onSuccess={handleDocumentUploadSuccess}
          title={
            showLineItemDocuments ? 'Attach Document to Line Item' : 'Attach Document to Estimate'
          }
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
        onOpenChange={open => !open && closeViewer()}
      />
    </div>
  );
};

export default EstimateDocumentUpload;
