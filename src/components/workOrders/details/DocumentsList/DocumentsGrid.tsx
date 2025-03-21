
import { WorkOrderDocument } from './types';
import DocumentCard from './DocumentCard';
import EmptyState from './EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentsGridProps {
  documents: WorkOrderDocument[];
  loading: boolean;
  onViewDocument: (document: WorkOrderDocument) => void;
  onToggleUploadForm: () => void;
}

const DocumentsGrid = ({ 
  documents, 
  loading, 
  onViewDocument, 
  onToggleUploadForm 
}: DocumentsGridProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (documents.length === 0) {
    return <EmptyState onToggleUploadForm={onToggleUploadForm} />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc) => (
        <DocumentCard 
          key={doc.document_id} 
          document={doc} 
          onViewDocument={onViewDocument} 
        />
      ))}
    </div>
  );
};

export default DocumentsGrid;
