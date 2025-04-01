
import React, { useState } from 'react';
import DocumentList from './DocumentList';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FolderIcon, FilterIcon, LayoutGrid, List, Table, Loader2, FileText, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Document } from './schemas/documentSchema';

interface DocumentViewsProps {
  documents: Document[];
  loading: boolean;
  activeFiltersCount: number;
  onView: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onBatchDelete?: (documentIds: string[]) => void;
  onUploadClick?: () => void;
  showNavigationButtons?: boolean;
}

const DocumentViews: React.FC<DocumentViewsProps> = ({
  documents,
  loading,
  activeFiltersCount,
  onView,
  onDelete,
  onBatchDelete,
  onUploadClick,
  showNavigationButtons = false
}) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const handleSwitchLayout = (newView: 'grid' | 'list') => {
    setView(newView);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium flex items-center">
          {activeFiltersCount > 0 ? (
            <>
              <FilterIcon className="mr-2 h-5 w-5 text-[#0485ea]" />
              Filtered Documents
              <Badge variant="outline" className="ml-2">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </Badge>
            </>
          ) : (
            <>
              <FolderIcon className="mr-2 h-5 w-5 text-[#0485ea]" />
              All Documents
            </>
          )}
        </h2>
        <div className="flex items-center space-x-2">
          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as any)}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-[#0485ea] animate-spin mb-4" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="font-medium mb-2">No documents found</h3>
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
      ) : (
        <>
          {view === 'grid' && (
            <DocumentList
              documents={documents}
              loading={loading}
              onDocumentDelete={onDelete}
              onBatchDelete={onBatchDelete}
              onUploadClick={onUploadClick}
              showEntityInfo={true}
              showCategories={false}
              showNavigationButtons={showNavigationButtons}
            />
          )}
          {view === 'list' && (
            <DocumentList
              documents={documents}
              loading={loading}
              onView={onView}
              onDocumentDelete={onDelete}
              onBatchDelete={onBatchDelete}
              onUploadClick={onUploadClick}
              showEntityInfo={true}
              showCategories={true}
              showNavigationButtons={showNavigationButtons}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DocumentViews;
