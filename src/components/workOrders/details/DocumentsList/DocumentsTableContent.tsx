
import { Table } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { WorkOrderDocument } from './types';
import DocumentsTableHeader from './DocumentsTableHeader';
import DocumentsTableBody from './DocumentsTableBody';
import EmptyState from './EmptyState';

interface DocumentsTableContentProps {
  documents: WorkOrderDocument[];
  loading: boolean;
  onViewDocument: (document: WorkOrderDocument) => void;
  onToggleUploadForm: () => void;
}

const DocumentsTableContent = ({
  documents,
  loading,
  onViewDocument,
  onToggleUploadForm
}: DocumentsTableContentProps) => {
  return (
    <Card className="shadow-sm border-[#0485ea]/10">
      <CardContent className="p-0">
        <div className="w-full overflow-x-auto">
          <Table>
            <DocumentsTableHeader />
            {documents.length === 0 ? (
              <EmptyState onToggleUploadForm={onToggleUploadForm} />
            ) : (
              <DocumentsTableBody 
                documents={documents} 
                onViewDocument={onViewDocument} 
              />
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsTableContent;
