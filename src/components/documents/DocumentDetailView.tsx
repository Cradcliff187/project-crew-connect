
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Link2 } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import DocumentViewer from './DocumentViewer';
import { formatDate } from '@/lib/utils';
import { useDocumentRelationships } from '@/hooks/useDocumentRelationships';
import DocumentRelationshipsList from './DocumentRelationshipsList';
import DocumentRelationshipForm from './DocumentRelationshipForm';

interface DocumentDetailViewProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  onDelete?: (document: Document) => void;
  onViewRelatedDocument?: (document: Document) => void;
}

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({
  document,
  open,
  onClose,
  onDelete,
  onViewRelatedDocument
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  
  // Use the document relationships hook
  const {
    relationships,
    loading: relationshipsLoading,
    createRelationship,
    deleteRelationship
  } = useDocumentRelationships(document?.document_id);
  
  // Handle view related document
  const handleViewRelatedDocument = (relatedDoc: Document) => {
    if (onViewRelatedDocument) {
      onViewRelatedDocument(relatedDoc);
    }
  };
  
  // Handle relationship creation
  const handleCreateRelationship = async (params: any) => {
    await createRelationship(params);
    setShowAddRelationship(false);
  };
  
  // Download handler
  const handleDownload = () => {
    if (document?.url) {
      window.open(document.url, '_blank');
    }
  };
  
  // Delete handler
  const handleDelete = () => {
    if (document && onDelete) {
      onDelete(document);
    }
  };
  
  // Check if the document ID matches the current document
  const isCurrentDocument = (documentId: string) => {
    return document?.document_id === documentId;
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {document?.file_name || 'Document Details'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="relationships">
                Relationships
                {relationships?.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {relationships.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              
              {onDelete && (
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
          
          <TabsContent value="preview" className="flex-1 mt-0">
            {document && (
              <DocumentViewer 
                document={document}
                open={open && activeTab === 'preview'}
                onOpenChange={() => {}}
              />
            )}
          </TabsContent>
          
          <TabsContent value="details" className="flex-1 mt-0">
            {document && (
              <div className="space-y-4 overflow-y-auto p-4 bg-gray-50 rounded-md h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">File Information</h3>
                    <div className="text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">File Name</span>
                        <span className="font-medium">{document.file_name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">File Type</span>
                        <span className="font-medium">{document.file_type || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">File Size</span>
                        <span className="font-medium">
                          {document.file_size 
                            ? `${Math.round(document.file_size / 1024)} KB` 
                            : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Uploaded</span>
                        <span className="font-medium">{formatDate(document.created_at)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Last Modified</span>
                        <span className="font-medium">{formatDate(document.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Metadata</h3>
                    <div className="text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{document.category || 'Uncategorized'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Entity Type</span>
                        <span className="font-medium">{document.entity_type}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="text-muted-foreground">Entity ID</span>
                        <span className="font-medium">{document.entity_id}</span>
                      </div>
                      {document.is_expense && (
                        <>
                          <div className="flex justify-between py-1 border-b">
                            <span className="text-muted-foreground">Is Receipt</span>
                            <span className="font-medium">Yes</span>
                          </div>
                          {document.amount && (
                            <div className="flex justify-between py-1 border-b">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-medium">${document.amount.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                      {document.notes && (
                        <div className="py-1">
                          <div className="text-muted-foreground mb-1">Notes</div>
                          <div className="font-medium bg-white p-2 rounded border text-sm">
                            {document.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="relationships" className="flex-1 mt-0">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold flex items-center gap-1">
                  <Link2 className="h-4 w-4 text-[#0485ea]" />
                  Document Relationships
                </h3>
                {!showAddRelationship && (
                  <Button 
                    size="sm"
                    variant="outline" 
                    className="text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
                    onClick={() => setShowAddRelationship(true)}
                  >
                    <Link2 className="h-4 w-4 mr-1" />
                    Add Relationship
                  </Button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {showAddRelationship ? (
                  <DocumentRelationshipForm 
                    documentId={document?.document_id || ''}
                    onCreateRelationship={handleCreateRelationship}
                    onCancel={() => setShowAddRelationship(false)}
                  />
                ) : (
                  <DocumentRelationshipsList 
                    relationships={relationships}
                    loading={relationshipsLoading}
                    onViewDocument={handleViewRelatedDocument}
                    onDeleteRelationship={deleteRelationship}
                    isCurrentDocument={isCurrentDocument}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetailView;
