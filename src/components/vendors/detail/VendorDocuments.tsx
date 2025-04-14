import React, { memo } from 'react';
import { useVendorDocuments } from './hooks/useVendorDocuments';
import DocumentsSection from '@/components/common/documents/DocumentsSection';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface VendorDocumentsProps {
  vendorId: string;
}

const VendorDocuments = memo(({ vendorId }: VendorDocumentsProps) => {
  const { documents, loading, fetchDocuments } = useVendorDocuments(vendorId);

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  return (
    <DocumentsSection
      documents={documents}
      loading={loading}
      entityId={vendorId}
      entityType={'VENDOR' as EntityType}
      onUploadSuccess={handleUploadSuccess}
      emptyStateMessage="No documents have been attached to this vendor"
    />
  );
});

VendorDocuments.displayName = 'VendorDocuments';

export default VendorDocuments;
