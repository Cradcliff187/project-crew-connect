import React from 'react';
import { FolderIcon, PaperclipIcon } from 'lucide-react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentPreviewCard from '@/components/documents/DocumentPreviewCard';
import { Badge } from '@/components/ui/badge';

interface DocumentCategory {
  category: string;
  documents: Document[];
}

interface DocumentUploadContentProps {
  documentsByCategory: Record<string, Document[]>;
  filteredDocuments: Document[];
  onViewDocument: (document: Document) => void;
  onRemoveDocument: (documentId: string) => void;
  showCategories?: boolean;
}

const EmptyDocumentsState = () => (
  <div className="text-center py-8 border rounded-md bg-muted/20">
    <div className="flex flex-col items-center gap-2">
      <PaperclipIcon className="h-8 w-8 text-muted-foreground" />
      <p className="text-muted-foreground">No documents attached yet.</p>
      <p className="text-xs text-muted-foreground">
        Click "Add Document" to attach receipts, contracts, or other relevant files.
      </p>
    </div>
  </div>
);

const CategoryDocuments = ({
  category,
  documents,
  onViewDocument,
  onRemoveDocument,
}: DocumentCategory & {
  onViewDocument: (document: Document) => void;
  onRemoveDocument: (documentId: string) => void;
}) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-gray-600 capitalize flex items-center">
      <FolderIcon className="h-4 w-4 mr-1 text-[#0485ea]" />
      {category}
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {documents.map(document => (
        <DocumentPreviewCard
          key={document.document_id}
          document={document}
          onView={() => onViewDocument(document)}
          onDelete={() => onRemoveDocument(document.document_id)}
        />
      ))}
    </div>
  </div>
);

const DocumentUploadContent: React.FC<DocumentUploadContentProps> = ({
  documentsByCategory,
  filteredDocuments,
  onViewDocument,
  onRemoveDocument,
  showCategories = true,
}) => {
  if (filteredDocuments.length === 0) {
    return <EmptyDocumentsState />;
  }

  if (showCategories && Object.keys(documentsByCategory).length > 0) {
    return (
      <div className="space-y-4">
        {Object.entries(documentsByCategory).map(([category, docs]) => (
          <CategoryDocuments
            key={category}
            category={category}
            documents={docs}
            onViewDocument={onViewDocument}
            onRemoveDocument={onRemoveDocument}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {filteredDocuments.map(document => (
        <DocumentPreviewCard
          key={document.document_id}
          document={document}
          onView={() => onViewDocument(document)}
          onDelete={() => onRemoveDocument(document.document_id)}
        />
      ))}
    </div>
  );
};

export default DocumentUploadContent;
