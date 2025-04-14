import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Trash2, Link2, Calendar, File } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { DocumentRelationship, RelationshipType } from '@/hooks/useDocumentRelationships';
import { Document } from './schemas/documentSchema';
import { DocumentCategoryBadge } from './utils/categoryIcons';

const relationshipLabels: Record<RelationshipType, string> = {
  REFERENCE: 'References',
  VERSION: 'Version of',
  ATTACHMENT: 'Attached to',
  RELATED: 'Related to',
  SUPPLEMENT: 'Supplements',
};

interface DocumentRelationshipsListProps {
  relationships: DocumentRelationship[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  isCurrentDocument: (documentId: string) => boolean;
}

const DocumentRelationshipsList: React.FC<DocumentRelationshipsListProps> = ({
  relationships,
  loading,
  onViewDocument,
  onDeleteRelationship,
  isCurrentDocument,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 text-[#0485ea] animate-spin" />
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No relationships found for this document
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relationships.map(relationship => {
        // Determine which document to show (the one that's not the current document)
        const relatedDoc =
          relationship.source_document && isCurrentDocument(relationship.source_document_id)
            ? relationship.target_document
            : relationship.source_document;

        if (!relatedDoc) return null;

        return (
          <Card key={relationship.id} className="overflow-hidden">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0485ea]" />
                  <CardTitle className="text-sm font-medium truncate">
                    {relatedDoc.file_name}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDeleteRelationship(relationship.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
              <CardDescription className="text-xs">
                <span className="flex items-center gap-1">
                  <Link2 className="h-3 w-3" />
                  {relationship.relationship_type === 'REFERENCE' &&
                  !isCurrentDocument(relationship.source_document_id)
                    ? 'Referenced by this document'
                    : `${relationshipLabels[relationship.relationship_type]} this document`}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center text-xs text-muted-foreground gap-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(relatedDoc.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <File className="h-3 w-3" />
                  {relatedDoc.file_type || 'Unknown'}
                </div>
                {relatedDoc.category && <DocumentCategoryBadge category={relatedDoc.category} />}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-2 h-8 text-xs bg-blue-50 hover:bg-blue-100 text-[#0485ea]"
                onClick={() => onViewDocument(relatedDoc as Document)}
              >
                View Document
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentRelationshipsList;
