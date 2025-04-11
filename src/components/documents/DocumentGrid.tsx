
import React from 'react';
import DocumentPreviewCard, { DocumentCardSkeleton } from './DocumentPreviewCard';
import { Document } from './schemas/documentSchema';
import { Grid2X2 } from 'lucide-react';

export interface DocumentGridProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  emptyMessage?: string;
  showEntityInfo?: boolean;
  showCategories?: boolean;
}

const DocumentGrid: React.FC<DocumentGridProps> = ({
  documents,
  loading,
  onViewDocument,
  emptyMessage = "No documents found",
  showEntityInfo = false,
  showCategories = true
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DocumentCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md">
        <Grid2X2 className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No Documents</h3>
        <p className="text-muted-foreground mt-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((document) => (
        <DocumentPreviewCard
          key={document.document_id}
          document={document}
          onView={onViewDocument}
          showEntityInfo={showEntityInfo}
        />
      ))}
    </div>
  );
};

export default DocumentGrid;
