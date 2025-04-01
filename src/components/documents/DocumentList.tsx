
import React from 'react';
import { Document } from './schemas/documentSchema';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentPreviewCard from './DocumentPreviewCard';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import DocumentViewer from './DocumentViewer';
import { getCategoryConfig } from './utils/categoryIcons';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onUploadClick?: () => void;
  onDocumentDelete?: (document: Document) => void;
  showEntityInfo?: boolean;
  emptyMessage?: string;
  showCategories?: boolean;
}

const DocumentList = ({
  documents,
  loading,
  onUploadClick,
  onDocumentDelete,
  showEntityInfo = false,
  emptyMessage = "No documents found",
  showCategories = false
}: DocumentListProps) => {
  const { 
    viewDocument, 
    closeViewer, 
    isViewerOpen, 
    currentDocument 
  } = useDocumentViewer();

  const handleViewDocument = (document: Document) => {
    viewDocument(document.document_id);
  };

  // Categorize documents by type if needed
  const documentsByCategory: Record<string, Document[]> = {};
  if (showCategories) {
    documents.forEach(doc => {
      const category = doc.category || 'other';
      if (!documentsByCategory[category]) {
        documentsByCategory[category] = [];
      }
      documentsByCategory[category].push(doc);
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-[#0485ea] animate-spin mb-4" />
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="font-medium mb-2">{emptyMessage}</h3>
        {onUploadClick && (
          <Button 
            onClick={onUploadClick}
            className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showCategories && Object.keys(documentsByCategory).length > 0 ? (
        // Show documents grouped by category
        Object.entries(documentsByCategory).map(([category, docs]) => {
          // Get category config for styling
          const categoryConfig = getCategoryConfig(category);
          const CategoryIcon = categoryConfig.icon;
          
          return (
            <div key={category} className="space-y-3">
              <h3 className="font-medium text-sm flex items-center gap-2" style={{ color: categoryConfig.color }}>
                <CategoryIcon className="h-4 w-4" />
                <span>{categoryConfig.label}</span>
                <span className="text-gray-500 font-normal">({docs.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((document) => (
                  <DocumentPreviewCard
                    key={document.document_id}
                    document={document}
                    onView={() => handleViewDocument(document)}
                    onDelete={onDocumentDelete ? () => onDocumentDelete(document) : undefined}
                    showEntityInfo={showEntityInfo}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        // Show documents without categories
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <DocumentPreviewCard
              key={document.document_id}
              document={document}
              onView={() => handleViewDocument(document)}
              onDelete={onDocumentDelete ? () => onDocumentDelete(document) : undefined}
              showEntityInfo={showEntityInfo}
            />
          ))}
        </div>
      )}

      {currentDocument && (
        <DocumentViewer
          document={currentDocument}
          open={isViewerOpen}
          onOpenChange={(open) => !open && closeViewer()}
        />
      )}
    </div>
  );
};

export default DocumentList;
