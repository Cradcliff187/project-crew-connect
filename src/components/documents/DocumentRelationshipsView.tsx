
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Link2, Trash2, Loader2 } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import useDocumentRelationships from '@/hooks/useDocumentRelationships';

interface DocumentRelationshipsViewProps {
  document: Document;
  onViewDocument: (document: Document) => void;
}

const DocumentRelationshipsView: React.FC<DocumentRelationshipsViewProps> = ({
  document,
  onViewDocument
}) => {
  const {
    relationships,
    loading,
    deleteRelationship
  } = useDocumentRelationships(document?.document_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        <span className="ml-2 text-muted-foreground">Loading relationships...</span>
      </div>
    );
  }

  if (!relationships || relationships.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-md">
        <p className="text-muted-foreground">No related documents found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use the "Link Document" button to create relationships between documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relationships.map((relation) => {
        // Determine which document to show (the one that's not the current document)
        const relatedDoc = relation.source_document_id === document.document_id
          ? relation.target_document
          : relation.source_document;
          
        if (!relatedDoc) return null;

        return (
          <div 
            key={relation.id}
            className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
          >
            <div 
              className="flex items-center flex-1 min-w-0 cursor-pointer"
              onClick={() => onViewDocument(relatedDoc as Document)}
            >
              <FileText className="h-5 w-5 text-[#0485ea] mr-3" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{relatedDoc.file_name}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="bg-blue-100 text-blue-800 rounded px-1 py-0.5 text-xs mr-2">
                    {relation.relationship_type}
                  </span>
                  <span>{new Date(relatedDoc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteRelationship(relation.id)}
              aria-label="Delete relationship"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentRelationshipsView;
