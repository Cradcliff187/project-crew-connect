
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2, Plus, Trash2 } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { RelatedDocument, useDocumentRelationships } from './hooks/useDocumentRelationships';
import DocumentRelationshipManager from './DocumentRelationshipManager';

interface DocumentRelationshipsViewProps {
  document: Document;
  onViewDocument?: (document: Document) => void;
  showManagementButton?: boolean;
}

const DocumentRelationshipsView: React.FC<DocumentRelationshipsViewProps> = ({
  document,
  onViewDocument,
  showManagementButton = true
}) => {
  const [showAddRelationship, setShowAddRelationship] = React.useState(false);
  
  const {
    relatedDocuments,
    loading,
    fetchRelationships,
    removeRelationship
  } = useDocumentRelationships(document?.document_id);
  
  const handleViewDocument = (doc: RelatedDocument) => {
    if (onViewDocument) {
      onViewDocument(doc);
    }
  };
  
  const getRelationshipLabel = (type: string): string => {
    switch (type) {
      case 'related_to': return 'Related to';
      case 'previous_version': return 'Previous version';
      case 'revision_of': return 'Revision of';
      case 'attachment_for': return 'Attachment for';
      case 'source_document': return 'Source document';
      case 'supporting_document': return 'Supporting document';
      default: return type.replace('_', ' ');
    }
  };
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Related Documents</h3>
        
        {showManagementButton && (
          <Button
            onClick={() => setShowAddRelationship(true)}
            variant="outline"
            size="sm"
            className="text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Document
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : relatedDocuments.length > 0 ? (
        <div className="space-y-2">
          {relatedDocuments.map(doc => (
            <Card key={doc.document_id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Link2 className="h-4 w-4 text-[#0485ea] shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-sm truncate">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.relationship_type && getRelationshipLabel(doc.relationship_type)} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0" 
                      onClick={() => handleViewDocument(doc)}
                    >
                      <span className="sr-only">View</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Button>
                    {doc.relationship_id && showManagementButton && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => removeRelationship(doc.relationship_id!)}
                      >
                        <span className="sr-only">Remove</span>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border rounded-md">
          <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-muted-foreground">No related documents</p>
          {showManagementButton && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4 text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50"
              onClick={() => setShowAddRelationship(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Link Document
            </Button>
          )}
        </div>
      )}
      
      {document && showAddRelationship && (
        <DocumentRelationshipManager
          document={document}
          open={showAddRelationship}
          onOpenChange={setShowAddRelationship}
          onRelationshipCreated={fetchRelationships}
        />
      )}
    </div>
  );
};

export default DocumentRelationshipsView;
