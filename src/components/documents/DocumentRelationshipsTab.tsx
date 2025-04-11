
// This file is no longer needed since we've replaced it with DocumentRelationshipsView.tsx
import React from 'react';
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
  // This is now just a wrapper for DocumentRelationshipsView
  return (
    <DocumentRelationshipsView
      document={document}
      onViewDocument={onViewDocument}
    />
  );
};

export default DocumentRelationshipsTab;
