
import React from 'react';
import { Document } from '@/components/documents/schemas/documentSchema';
import DocumentCard from './DocumentCard';

interface DocumentListProps {
  documents: Document[];
  openDocument: (url: string) => void;
  getDocumentIcon: (fileType: string | null) => JSX.Element;
  formatFileSize: (bytes: number | null) => string;
  getCategoryBadgeColor: (category: string) => string;
  formatCategoryName: (category: string) => string;
  getVendorTypeDisplay: (vendorType: string) => string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  openDocument,
  getDocumentIcon,
  formatFileSize,
  getCategoryBadgeColor,
  formatCategoryName,
  getVendorTypeDisplay
}) => {
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.document_id}
          document={doc}
          openDocument={openDocument}
          getDocumentIcon={getDocumentIcon}
          formatFileSize={formatFileSize}
          getCategoryBadgeColor={getCategoryBadgeColor}
          formatCategoryName={formatCategoryName}
          getVendorTypeDisplay={getVendorTypeDisplay}
        />
      ))}
    </div>
  );
};

export default DocumentList;
