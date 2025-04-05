
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentRelationshipsTab from './DocumentRelationshipsTab';
import { Document } from './schemas/documentSchema';

interface RelationshipsTabProps {
  document: Document;
  onViewDocument: (document: Document) => void;
}

const RelationshipsTab: React.FC<RelationshipsTabProps> = ({
  document,
  onViewDocument
}) => {
  return (
    <Tabs defaultValue="relationships" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="relationships">Related Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="relationships">
        <DocumentRelationshipsTab
          document={document}
          onViewDocument={onViewDocument}
        />
      </TabsContent>
    </Tabs>
  );
};

export default RelationshipsTab;
