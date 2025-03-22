
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Plus, X, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityType } from '@/components/documents/schemas/documentSchema';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WorkOrderDocument {
  document_id: string;
  file_name: string;
  category: string | null;
  created_at: string;
  file_type: string | null;
  storage_path?: string;
  url?: string;
  is_receipt?: boolean;
}

interface WorkOrderDocumentsListProps {
  workOrderId: string;
}

const WorkOrderDocumentsList = ({ workOrderId }: WorkOrderDocumentsListProps) => {
  const [documents, setDocuments] = useState<WorkOrderDocument[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewDocument, setViewDocument] = useState<WorkOrderDocument | null>(null);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      console.log('Fetching documents for work order:', workOrderId);
      
      // Fetch direct work order documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('document_id, file_name, category, created_at, file_type, storage_path')
        .eq('entity_id', workOrderId)
        .eq('entity_type', 'WORK_ORDER');
          
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        return;
      }
      
      // Fetch receipt documents linked to work order materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('work_order_materials')
        .select('receipt_document_id')
        .eq('work_order_id', workOrderId)
        .not('receipt_document_id', 'is', null);
      
      if (materialsError) {
        console.error('Error fetching material receipts:', materialsError);
        return;
      }
      
      // Extract document IDs from materials
      const receiptDocumentIds = materialsData
        .map(material => material.receipt_document_id)
        .filter(id => id !== null);
      
      // If we have receipt documents, fetch them
      let receiptDocuments: any[] = [];
      if (receiptDocumentIds.length > 0) {
        const { data: receiptsData, error: receiptsError } = await supabase
          .from('documents')
          .select('document_id, file_name, category, created_at, file_type, storage_path')
          .in('document_id', receiptDocumentIds);
        
        if (receiptsError) {
          console.error('Error fetching receipt documents:', receiptsError);
        } else {
          // Mark these as receipts for display purposes
          receiptDocuments = receiptsData.map(doc => ({
            ...doc,
            is_receipt: true
          }));
        }
      }
      
      // Combine all documents
      const allDocuments = [...(documentsData || []), ...receiptDocuments];
      
      // Get public URLs for documents
      const enhancedDocuments = await Promise.all(
        allDocuments.map(async (doc) => {
          let url = '';
          if (doc.storage_path) {
            const { data } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);
            url = data.publicUrl;
          }
          
          return {
            ...doc,
            url
          };
        })
      );
      
      console.log('Fetched documents:', enhancedDocuments);
      setDocuments(enhancedDocuments);
    } catch (error) {
      console.error('Error processing documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDocuments();
  }, [workOrderId]);

  // Toggle document upload form
  const toggleUploadForm = () => {
    setShowUploadForm(!showUploadForm);
  };

  // Handle successful document upload
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    fetchDocuments();
  };
  
  // Handle view document
  const handleViewDocument = (doc: WorkOrderDocument) => {
    setViewDocument(doc);
  };
  
  // Close document viewer
  const handleCloseViewer = () => {
    setViewDocument(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Documents & Receipts</CardTitle>
          <Button 
            variant="outline" 
            className="text-[#0485ea]"
            onClick={toggleUploadForm}
          >
            {showUploadForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel Upload
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {showUploadForm && (
          <div className="mb-6">
            <EnhancedDocumentUpload 
              entityType={"WORK_ORDER" as EntityType}
              entityId={workOrderId}
              onSuccess={handleUploadSuccess}
              onCancel={() => setShowUploadForm(false)}
            />
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <Card key={doc.document_id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <FileText className="h-10 w-10 mr-3 text-muted-foreground shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-medium truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.is_receipt ? 'Material Receipt' : doc.category ? doc.category : 'Uncategorized'} • {formatDate(doc.created_at)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-[#0485ea]"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-[#0485ea]"
                          asChild
                        >
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md">
            <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No documents attached to this work order</p>
            <Button 
              variant="outline" 
              className="mt-4 text-[#0485ea]"
              onClick={toggleUploadForm}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Document
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Document Viewer Dialog */}
      <Dialog open={!!viewDocument} onOpenChange={(open) => !open && handleCloseViewer()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{viewDocument?.file_name}</DialogTitle>
          </DialogHeader>
          {viewDocument && (
            <div className="space-y-4">
              <div className="border rounded-md overflow-hidden h-[400px]">
                {viewDocument.file_type?.startsWith('image/') ? (
                  <img
                    src={viewDocument.url}
                    alt={viewDocument.file_name}
                    className="w-full h-full object-contain"
                  />
                ) : viewDocument.file_type?.includes('pdf') ? (
                  <iframe
                    src={viewDocument.url}
                    title={viewDocument.file_name}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <p>Preview not available</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCloseViewer}>
                  Close
                </Button>
                <Button 
                  variant="outline"
                  className="text-[#0485ea]"
                  asChild
                >
                  <a href={viewDocument.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WorkOrderDocumentsList;
