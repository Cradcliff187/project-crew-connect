import React, { useState, useMemo, useEffect } from 'react';
import { Document } from './schemas/documentSchema';
import { FileText, Loader2, Upload, Download, Trash2, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentPreviewCard from './DocumentPreviewCard';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import DocumentViewer from './DocumentViewer';
import { getCategoryConfig } from './utils/categoryIcons';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import DocumentGroup from './DocumentGroup';
import { documentListAnimations } from '@/lib/animations';
import { useResponsiveDocumentView } from '@/hooks/use-responsive-document-view';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onView?: (document: Document) => void;
  onUploadClick?: () => void;
  onDocumentDelete?: (document: Document) => void;
  onBatchDelete?: (documentIds: string[]) => void;
  showEntityInfo?: boolean;
  emptyMessage?: string;
  showCategories?: boolean;
  showNavigationButtons?: boolean;
}

const DocumentList = ({
  documents,
  loading,
  onView,
  onUploadClick,
  onDocumentDelete,
  onBatchDelete,
  showEntityInfo = false,
  emptyMessage = 'No documents found',
  showCategories = false,
  showNavigationButtons = false,
}: DocumentListProps) => {
  const { viewDocument, closeViewer, isViewerOpen, currentDocument } = useDocumentViewer();

  const { viewMode } = useResponsiveDocumentView({
    defaultView: 'grid',
    breakpoints: {
      compact: 640,
      list: 768,
      grid: 1024,
    },
  });

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const documentsByCategory = useMemo(() => {
    if (!showCategories) return null;

    const groupedDocs: Record<string, Document[]> = {};

    documents.forEach(doc => {
      const category = doc.category || 'other';
      if (!groupedDocs[category]) {
        groupedDocs[category] = [];
      }
      groupedDocs[category].push(doc);
    });

    return groupedDocs;
  }, [documents, showCategories]);

  useEffect(() => {
    if (documentsByCategory) {
      const initialState: Record<string, boolean> = {};
      Object.keys(documentsByCategory).forEach(category => {
        initialState[category] = true; // Default to expanded
      });
      setExpandedGroups(initialState);
    }
  }, [documentsByCategory]);

  const handleViewDocument = (document: Document) => {
    if (batchMode) {
      handleToggleSelection(document.document_id || '');
      return;
    }

    if (onView) {
      onView(document);
    } else {
      viewDocument(document.document_id || '');
    }
  };

  const handleToggleSelection = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId) ? prev.filter(id => id !== documentId) : [...prev, documentId]
    );
  };

  const toggleBatchMode = () => {
    setBatchMode(prev => !prev);
    if (batchMode) {
      setSelectedDocuments([]);
    }
  };

  const handleBatchDownload = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: 'No documents selected',
        description: 'Please select at least one document to download',
        variant: 'destructive',
      });
      return;
    }

    const docsToDownload = documents.filter(
      doc => selectedDocuments.includes(doc.document_id || '') && doc.url
    );

    docsToDownload.forEach(doc => {
      if (doc.url) {
        window.open(doc.url, '_blank');
      }
    });

    toast({
      title: 'Downloads initiated',
      description: `Started downloading ${docsToDownload.length} document(s)`,
    });
  };

  const handleBatchDelete = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: 'No documents selected',
        description: 'Please select at least one document to delete',
        variant: 'destructive',
      });
      return;
    }

    if (onBatchDelete) {
      onBatchDelete(selectedDocuments);
      setSelectedDocuments([]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.document_id || '').filter(Boolean));
    }
  };

  const toggleGroupExpand = (category: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-pulse">
        <Loader2 className="h-8 w-8 text-[#0485ea] animate-spin mb-4" />
        <p className="text-muted-foreground">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
        <h3 className="font-medium mb-2">{emptyMessage}</h3>
        {onUploadClick && (
          <Button
            onClick={onUploadClick}
            className="mt-4 bg-[#0485ea] hover:bg-[#0375d1] animate-fade-in"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>
    );
  }

  const renderBatchActions = () => {
    if (!batchMode) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md border animate-fade-in">
        <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-sm">
          {selectedDocuments.length === documents.length ? 'Deselect All' : 'Select All'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleBatchDownload}
          disabled={selectedDocuments.length === 0}
          className="text-sm"
        >
          <Download className="h-4 w-4 mr-1" />
          Download ({selectedDocuments.length})
        </Button>

        {onBatchDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchDelete}
            disabled={selectedDocuments.length === 0}
            className="text-sm text-destructive border-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete ({selectedDocuments.length})
          </Button>
        )}

        <div className="flex-1"></div>

        <Button variant="outline" size="sm" onClick={toggleBatchMode} className="text-sm">
          Exit Batch Mode
        </Button>
      </div>
    );
  };

  if (showCategories && documentsByCategory && Object.keys(documentsByCategory).length > 0) {
    return (
      <div className={`space-y-6 ${documentListAnimations.container}`}>
        <div className="flex justify-end mb-2">
          <Button
            variant={batchMode ? 'default' : 'outline'}
            size="sm"
            onClick={toggleBatchMode}
            className={batchMode ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
          >
            {batchMode ? 'Exit Batch Mode' : 'Batch Operations'}
          </Button>
        </div>

        {renderBatchActions()}

        <div className="space-y-6">
          {Object.entries(documentsByCategory).map(([category, docs]) => (
            <DocumentGroup
              key={category}
              title={category}
              documents={docs}
              onViewDocument={handleViewDocument}
              onDeleteDocument={onDocumentDelete && !batchMode ? onDocumentDelete : undefined}
              showEntityInfo={showEntityInfo}
              isExpanded={expandedGroups[category]}
              onToggleExpand={() => toggleGroupExpand(category)}
              showNavigationButton={showNavigationButtons}
              batchMode={batchMode}
              selectedDocuments={selectedDocuments}
              onToggleSelection={handleToggleSelection}
            />
          ))}
        </div>

        {!onView && currentDocument && (
          <DocumentViewer
            document={currentDocument}
            open={isViewerOpen}
            onOpenChange={open => !open && closeViewer()}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${documentListAnimations.container}`}>
      <div className="flex justify-end mb-2">
        <Button
          variant={batchMode ? 'default' : 'outline'}
          size="sm"
          onClick={toggleBatchMode}
          className={batchMode ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
        >
          {batchMode ? 'Exit Batch Mode' : 'Batch Operations'}
        </Button>
      </div>

      {renderBatchActions()}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(document => (
          <div key={document.document_id} className={`relative ${documentListAnimations.item}`}>
            {batchMode && (
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedDocuments.includes(document.document_id || '')}
                  onCheckedChange={() => handleToggleSelection(document.document_id || '')}
                  className="bg-white border-gray-300"
                />
              </div>
            )}
            <DocumentPreviewCard
              key={document.document_id}
              document={document}
              onView={() => handleViewDocument(document)}
              onDelete={
                onDocumentDelete && !batchMode ? () => onDocumentDelete(document) : undefined
              }
              showEntityInfo={showEntityInfo}
              isSelected={selectedDocuments.includes(document.document_id || '')}
              batchMode={batchMode}
              showNavigationButton={showNavigationButtons}
            />
          </div>
        ))}
      </div>

      {!onView && currentDocument && (
        <DocumentViewer
          document={currentDocument}
          open={isViewerOpen}
          onOpenChange={open => !open && closeViewer()}
        />
      )}
    </div>
  );
};

export default DocumentList;
