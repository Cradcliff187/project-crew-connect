import React from 'react';
import { Document } from './schemas/documentSchema';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentCard from './DocumentCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentsGridProps {
  documents: Document[];
  isLoading: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  getActions?: (
    document: Document
  ) => Array<{ icon: React.ReactNode; label: string; onClick: () => void }>;
  onDocumentClick?: (document: Document) => void;
}

const DocumentsGrid: React.FC<DocumentsGridProps> = ({
  documents,
  isLoading,
  emptyMessage = 'No documents found',
  emptyDescription = 'Upload documents to get started.',
  getActions,
  onDocumentClick,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-muted rounded-md mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded-md mb-2"></div>
          <div className="h-3 w-24 bg-muted rounded-md"></div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border rounded-md">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg mb-2">{emptyMessage}</p>
        {emptyDescription && <p className="text-sm mb-4">{emptyDescription}</p>}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(document => (
          <DocumentCard
            key={document.document_id || document.file_name}
            document={document}
            onClick={() => onDocumentClick && onDocumentClick(document)}
            getActions={getActions}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default DocumentsGrid;
