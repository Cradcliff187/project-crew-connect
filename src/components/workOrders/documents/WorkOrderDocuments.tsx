
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import DocumentGrid from '@/components/projects/detail/DocumentsList/DocumentsGrid';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [workOrderId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents_with_urls')
        .select('*')
        .eq('entity_id', workOrderId)
        .eq('entity_type', entityType)
        .eq('is_latest_version', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = () => {
    fetchDocuments();
    setUploadDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents</h3>
        <Button 
          onClick={() => setUploadDialogOpen(true)} 
          size="sm"
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Document
        </Button>
      </div>

      {documents.length === 0 && !loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-2">No documents found</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setUploadDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Upload First Document
          </Button>
        </Card>
      ) : (
        <DocumentGrid 
          documents={documents} 
          loading={loading} 
          onDocumentsRefresh={fetchDocuments}
        />
      )}

      {uploadDialogOpen && (
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          entityId={workOrderId}
          entityType={entityType}
          onDocumentUploaded={handleDocumentUploaded}
        />
      )}
    </div>
  );
};

export default WorkOrderDocuments;
