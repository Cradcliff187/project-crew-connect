
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, LinkIcon } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { useDocumentRelationships } from '@/hooks/useDocumentRelationships';
import DocumentRelationshipsList from './DocumentRelationshipsList';
import DocumentRelationshipForm from './DocumentRelationshipForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentRelationshipsTabProps {
  document: Document;
  onViewDocument: (document: Document) => void;
}

const DocumentRelationshipsTab: React.FC<DocumentRelationshipsTabProps> = ({
  document,
  onViewDocument
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    relationships,
    loading,
    fetchRelationships,
    deleteRelationship
  } = useDocumentRelationships(document.document_id);

  // Check if a document is the current document
  const isCurrentDocument = (documentId: string) => {
    return documentId === document.document_id;
  };
  
  // Get already linked document IDs to prevent duplicate relationships
  const getLinkedDocumentIds = () => {
    const linkedIds: string[] = [];
    relationships.forEach(rel => {
      if (rel.source_document_id === document.document_id) {
        linkedIds.push(rel.target_document_id);
      } else {
        linkedIds.push(rel.source_document_id);
      }
    });
    return linkedIds;
  };
  
  // Handle relationship creation success
  const handleRelationshipCreated = () => {
    setIsFormOpen(false);
    fetchRelationships();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Document Relationships</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchRelationships}
            className="text-[#0485ea]"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button 
            size="sm" 
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Document
          </Button>
        </div>
      </div>

      {relationships.length === 0 && !loading ? (
        <div className="text-center py-6 border rounded-md">
          <LinkIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground">No document relationships found</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Document Link
          </Button>
        </div>
      ) : (
        <DocumentRelationshipsList
          relationships={relationships}
          loading={loading}
          onViewDocument={onViewDocument}
          onDeleteRelationship={deleteRelationship}
          isCurrentDocument={isCurrentDocument}
        />
      )}
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Link Document</DialogTitle>
          </DialogHeader>
          <DocumentRelationshipForm
            sourceDocumentId={document.document_id}
            onSuccess={handleRelationshipCreated}
            onCancel={() => setIsFormOpen(false)}
            excludeDocumentIds={getLinkedDocumentIds()}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentRelationshipsTab;
