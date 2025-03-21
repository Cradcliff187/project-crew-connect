
import React from 'react';
import { Document } from '../schemas/documentSchema';
import DocumentCard from '../DocumentCard';

interface MobileDocumentListProps {
  documents: Document[];
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const MobileDocumentList: React.FC<MobileDocumentListProps> = ({ 
  documents, 
  onView, 
  onDelete 
}) => {
  return (
    <div className="md:hidden grid grid-cols-1 gap-3">
      {documents.map((document) => (
        <DocumentCard
          key={document.document_id}
          document={document}
          onView={() => onView(document)}
          onDelete={() => onDelete(document)}
        />
      ))}
    </div>
  );
};

export default MobileDocumentList;
