
import React, { useState } from 'react';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentList from './DocumentList';
import DocumentGrid from './DocumentGrid';
import DocumentTable from './DocumentTable';
import { FileText, Grid, Table, List } from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'table';

interface DocumentViewsProps {
  documents: Document[];
  loading: boolean;
  onViewDocument: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  onBatchDelete?: (documentIds: string[]) => void;
  onUploadClick?: () => void;
  showEntityInfo?: boolean;
  showCategories?: boolean;
  showNavigationButtons?: boolean;
  emptyMessage?: string;
  initialViewMode?: ViewMode;
}

const DocumentViews: React.FC<DocumentViewsProps> = ({
  documents,
  loading,
  onViewDocument,
  onDocumentDelete,
  onBatchDelete,
  onUploadClick,
  showEntityInfo = false,
  showCategories = true,
  showNavigationButtons = false,
  emptyMessage = "No documents found",
  initialViewMode = 'grid'
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  
  // Handle document selection for batch operations
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };
  
  // Clear all selections
  const clearSelection = () => {
    setSelectedDocuments([]);
  };
  
  // Delete selected documents
  const handleBatchDelete = () => {
    if (onBatchDelete && selectedDocuments.length > 0) {
      onBatchDelete(selectedDocuments);
      clearSelection();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table className="h-4 w-4 mr-2" />
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          {selectedDocuments.length > 0 && onBatchDelete && (
            <>
              <Button 
                variant="outline"
                onClick={clearSelection}
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleBatchDelete}
                size="sm"
              >
                Delete Selected ({selectedDocuments.length})
              </Button>
            </>
          )}
          {onUploadClick && (
            <Button 
              onClick={onUploadClick}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <FileText className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      </div>
      
      {viewMode === 'grid' && (
        <DocumentGrid
          documents={documents}
          loading={loading}
          onViewDocument={onViewDocument}
          onDocumentDelete={onDocumentDelete}
          emptyMessage={emptyMessage}
          showEntityInfo={showEntityInfo}
          showCategories={showCategories}
        />
      )}
      
      {viewMode === 'list' && (
        <DocumentList
          documents={documents}
          loading={loading}
          onViewDocument={onViewDocument}
          onDocumentDelete={onDocumentDelete}
          emptyMessage={emptyMessage}
          showEntityInfo={showEntityInfo}
          showCategories={showCategories}
        />
      )}
      
      {viewMode === 'table' && (
        <DocumentTable
          documents={documents}
          loading={loading}
          onViewDocument={onViewDocument}
          onDocumentDelete={onDocumentDelete}
          emptyMessage={emptyMessage}
          selectedDocuments={selectedDocuments}
          onToggleSelection={toggleDocumentSelection}
          showEntityInfo={showEntityInfo}
          showCategories={showCategories}
        />
      )}
    </div>
  );
};

export default DocumentViews;
