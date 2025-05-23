import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Upload } from 'lucide-react';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { useWorkOrderDocumentsEmbed } from './useWorkOrderDocumentsEmbed';

interface WorkOrderDocumentsProps {
  workOrderId: string;
  entityType: string;
}

const WorkOrderDocuments = ({ workOrderId, entityType }: WorkOrderDocumentsProps) => {
  const { documents, loading, refetchDocuments } = useWorkOrderDocumentsEmbed(
    workOrderId,
    entityType
  );
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
      <CardHeader className="p-4">
        <div className="flex justify-between items-center bg-primary/10 p-4 rounded-md">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-base font-medium">Work Order Documents</h3>
          </CardTitle>
          <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex justify-between items-center bg-primary/10 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium">Work Order Documents</h3>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)} size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="shadow-sm border-primary/10">
              <div className="p-0">
                {documents.length === 0 && !loading ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground mb-2">No documents found</p>
                    <Button variant="outline" size="sm" onClick={() => setUploadDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Upload First Document
                    </Button>
                  </div>
                ) : (
                  <div className="p-4">
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-6 w-full bg-gray-100 animate-pulse rounded"></div>
                        <div className="h-24 w-full bg-gray-100 animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map(doc => (
                          <div
                            key={doc.document_id}
                            className="border p-3 rounded-md shadow-sm hover:shadow-md cursor-pointer"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{doc.file_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleViewDocument(doc);
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
      </CardContent>
    </div>
  );
};

export default WorkOrderDocuments;
