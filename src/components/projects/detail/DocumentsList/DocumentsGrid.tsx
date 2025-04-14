import { FileText, File, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectDocument } from './types';
import DocumentCard from './DocumentCard';

interface DocumentsGridProps {
  documents: ProjectDocument[];
  loading: boolean;
  onViewDocument: (document: ProjectDocument) => void;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full rounded-md" />
          ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="font-medium mb-2">No Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There are no documents attached to this project yet.
        </p>
        <Button onClick={onToggleUploadForm} className="bg-[#0485ea] hover:bg-[#0375d1]">
          <Plus className="h-4 w-4 mr-1" />
          Add Document
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} onView={() => onViewDocument(doc)} />
      ))}
    </div>
  );
};

export default DocumentsGrid;
