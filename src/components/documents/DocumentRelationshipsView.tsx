import React, { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LinkIcon, Trash2 } from 'lucide-react';

// Use generated type alias
type DocumentRow = Database['public']['Tables']['documents']['Row'];

// Assuming relationships are fetched and passed in
// Need to define Relationship type properly based on actual data structure
interface Relationship {
  id: string;
  related_document_id: string;
  related_document_name: string;
  relationship_type: string;
}

interface DocumentRelationshipsViewProps {
  document: DocumentRow;
  relationships: Relationship[];
  onAddRelationship: () => void; // Placeholder for triggering add/link flow
  onRemoveRelationship: (relationshipId: string) => void; // Placeholder
}

const DocumentRelationshipsView: React.FC<DocumentRelationshipsViewProps> = ({
  document,
  relationships,
  onAddRelationship,
  onRemoveRelationship,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Relationships</CardTitle>
          <Button variant="outline" size="sm" onClick={onAddRelationship}>
            <LinkIcon className="mr-2 h-4 w-4" /> Link Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {relationships.length === 0 ? (
          <p className="text-muted-foreground text-sm">No linked documents.</p>
        ) : (
          <ul className="space-y-2">
            {relationships.map(rel => (
              <li
                key={rel.id}
                className="flex justify-between items-center text-sm p-2 border rounded"
              >
                <div>
                  <span className="font-medium">{rel.related_document_name}</span>
                  <span className="text-muted-foreground ml-2">({rel.relationship_type})</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  onClick={() => onRemoveRelationship(rel.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentRelationshipsView;
