
import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Document } from './schemas/documentSchema';
import DocumentList from './DocumentList';
import DocumentGrid from './DocumentGrid';
import DocumentTable from './DocumentTable';
import { Loader2 } from 'lucide-react';

export interface DocumentViewsProps {
  documents: Document[];
  loading: boolean;
  onView: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onBatchDelete?: (documentIds: string[]) => void;
  onUploadClick?: () => void;
  emptyMessage?: string;
  showEntityInfo?: boolean;
  activeFiltersCount?: number;
  showNavigationButtons?: boolean;
}

const DocumentViews: React.FC<DocumentViewsProps> = ({
  documents,
  loading,
  onView,
  onDelete,
  onBatchDelete,
  onUploadClick,
  emptyMessage,
  showEntityInfo = false,
  activeFiltersCount = 0,
  showNavigationButtons = false
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (documents.length === 0) {
    if (activeFiltersCount > 0) {
      return (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No documents match your filters</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
        </div>
      );
    }

    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">{emptyMessage || "No documents found"}</h3>
        <p className="text-muted-foreground mb-4">
          Upload documents to get started
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="grid" className="w-full" onValueChange={(value) => setViewMode(value as any)}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="grid" className="mt-2">
        <DocumentGrid 
          documents={documents}
          loading={loading}
          onViewDocument={onView}
          showEntityInfo={showEntityInfo}
          showCategories={true}
        />
      </TabsContent>

      <TabsContent value="list" className="mt-2">
        <DocumentList 
          documents={documents}
          loading={loading}
          onView={onView}
          onDocumentDelete={onDelete}
          onBatchDelete={onBatchDelete}
          onUploadClick={onUploadClick}
          showEntityInfo={showEntityInfo}
          showCategories={true}
          showNavigationButtons={showNavigationButtons}
        />
      </TabsContent>

      <TabsContent value="table" className="mt-2">
        <DocumentTable 
          documents={documents}
          loading={loading}
          onViewDocument={onView}
          onDeleteDocument={onDelete}
          showEntityInfo={showEntityInfo}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentViews;
