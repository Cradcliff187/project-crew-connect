import { WorkOrderDocument } from './types';
import DocumentCard from './DocumentCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

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
  onToggleUploadForm,
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
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="font-medium mb-2">No Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no documents attached to this work order yet.
        </p>
        <Button onClick={onToggleUploadForm} className="bg-[#0485ea] hover:bg-[#0375d1]">
          <Plus className="h-4 w-4 mr-1" />
          Add Document
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map(doc => (
        <DocumentCard key={doc.document_id} document={doc} onViewDocument={onViewDocument} />
      ))}
    </div>
  );
};

export default DocumentsGrid;
