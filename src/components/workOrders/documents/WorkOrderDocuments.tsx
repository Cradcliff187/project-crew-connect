
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { DocumentsGrid } from '@/components/documents';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { useWorkOrderDocumentsEmbed } from './useWorkOrderDocumentsEmbed';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

interface CustomDocumentsGridProps {
  documents: any[];
  loading: boolean;
  onViewDocument?: (doc: any) => void;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const { documents, loading, refetchDocuments } = useWorkOrderDocumentsEmbed(workOrderId, entityType);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleDocumentUploaded = () => {
    refetchDocuments();
    setUploadDialogOpen(false);
  };

  const handleViewDocument = (doc: any) => {
    window.open(doc.url, '_blank');
  };

  // Convert string entityType to proper EntityType enum
  const getEntityType = (): EntityType => {
    switch (entityType.toUpperCase()) {
      case 'WORK_ORDER':
        return 'WORK_ORDER' as EntityType;
      case 'PROJECT':
        return 'PROJECT' as EntityType;
      case 'ESTIMATE':
        return 'ESTIMATE' as EntityType;
      case 'CUSTOMER':
        return 'CUSTOMER' as EntityType;
      case 'VENDOR':
        return 'VENDOR' as EntityType;
      case 'SUBCONTRACTOR':
        return 'SUBCONTRACTOR' as EntityType;
      case 'EXPENSE':
        return 'EXPENSE' as EntityType;
      case 'TIME_ENTRY':
        return 'TIME_ENTRY' as EntityType;
      case 'EMPLOYEE':
        return 'EMPLOYEE' as EntityType;
      case 'ESTIMATE_ITEM':
        return 'ESTIMATE_ITEM' as EntityType;
      default:
        return 'WORK_ORDER' as EntityType;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#0485ea]/10 p-4 rounded-md">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">Work Order Documents</h3>
        </div>
        <Button 
          onClick={() => setUploadDialogOpen(true)}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="shadow-sm border-[#0485ea]/10">
            <div className="p-0">
              {documents.length === 0 && !loading ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-2">No documents found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <DocumentsGrid 
                  documents={documents} 
                  loading={loading}
                  onViewDocument={handleViewDocument}
                />
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {uploadDialogOpen && (
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          entityId={workOrderId}
          entityType={getEntityType()}
          onSuccess={handleDocumentUploaded}
        />
      )}
    </div>
  );
};

export default WorkOrderDocuments;
