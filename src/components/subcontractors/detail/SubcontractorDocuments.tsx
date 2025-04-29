import React, { memo } from 'react';
import DocumentsSection from '@/components/common/documents/DocumentsSection';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { Database } from '@/integrations/supabase/types';

type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface SubcontractorDocumentsProps {
  documents: DocumentRow[];
  loading: boolean;
  subcontractorId: string;
  onUploadSuccess: () => void;
}

const SubcontractorDocuments = memo(
  ({ documents, loading, subcontractorId, onUploadSuccess }: SubcontractorDocumentsProps) => {
    return (
      <DocumentsSection
        documents={documents}
        loading={loading}
        entityId={subcontractorId}
        entityType={'SUBCONTRACTOR' as EntityType}
        onUploadSuccess={onUploadSuccess}
        emptyStateMessage="No documents have been attached to this subcontractor"
      />
    );
  }
);

SubcontractorDocuments.displayName = 'SubcontractorDocuments';

export default SubcontractorDocuments;
