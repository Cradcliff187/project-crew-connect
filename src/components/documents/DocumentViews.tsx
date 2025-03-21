
import React from 'react';
import { Document } from './schemas/documentSchema';
import DocumentLoading from './components/DocumentLoading';
import DocumentEmpty from './components/DocumentEmpty';
import MobileDocumentList from './components/MobileDocumentList';
import DesktopDocumentTable from './components/DesktopDocumentTable';

interface DocumentViewsProps {
  documents: Document[];
  loading: boolean;
  activeFiltersCount: number;
  onView: (document: Document) => void;
  onDelete: (document: Document) => void;
  onUploadClick: () => void;
}

export const DocumentViews = ({ 
  documents, 
  loading, 
  activeFiltersCount,
  onView, 
  onDelete,
  onUploadClick
}: DocumentViewsProps) => {
  if (loading) {
    return <DocumentLoading />;
  }
  
  if (documents.length === 0) {
    return (
      <DocumentEmpty 
        activeFiltersCount={activeFiltersCount} 
        onUploadClick={onUploadClick} 
      />
    );
  }
  
  return (
    <>
      <MobileDocumentList 
        documents={documents} 
        onView={onView} 
        onDelete={onDelete} 
      />
      <DesktopDocumentTable 
        documents={documents} 
        onView={onView} 
        onDelete={onDelete} 
      />
    </>
  );
};

export default DocumentViews;
