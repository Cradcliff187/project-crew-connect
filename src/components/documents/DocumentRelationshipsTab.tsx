
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentRelationshipsView from './DocumentRelationshipsView';
import { Document } from './schemas/documentSchema';

interface DocumentRelationshipsTabProps {
  document: Document;
  onViewDocument: (document: Document) => void;
}

const DocumentRelationshipsTab: React.FC<DocumentRelationshipsTabProps> = ({
  document,
  onViewDocument
}) => {
  return (
    <Tabs defaultValue="relationships" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="relationships">Related Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="relationships">
        <DocumentRelationshipsView
          document={document}
          onViewDocument={onViewDocument}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentRelationshipsTab;
