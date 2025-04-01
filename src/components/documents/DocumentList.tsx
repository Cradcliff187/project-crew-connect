
import React, { useState } from 'react';
import { Document } from './schemas/documentSchema';
import { FileText, Loader2, Upload, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentPreviewCard from './DocumentPreviewCard';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import DocumentViewer from './DocumentViewer';
import { getCategoryConfig } from './utils/categoryIcons';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
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
  onUploadClick,
  onDocumentDelete,
  onBatchDelete,
  showEntityInfo = false,
  emptyMessage = "No documents found",
  showCategories = false,
  showNavigationButtons = false
}: DocumentListProps) => {
  const { 
    viewDocument, 
    closeViewer, 
    isViewerOpen, 
    currentDocument 
  } = useDocumentViewer();
  
  // State for batch selection
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [batchMode, setBatchMode] = useState(false);

  const handleViewDocument = (document: Document) => {
    // In batch mode, toggle selection instead of viewing
    if (batchMode) {
      handleToggleSelection(document.document_id);
      return;
    }
    viewDocument(document.document_id);
  };

  // Handle document selection
  const handleToggleSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  // Toggle batch mode
  const toggleBatchMode = () => {
    setBatchMode(prev => !prev);
    if (batchMode) {
      // Clear selection when exiting batch mode
      setSelectedDocuments([]);
    }
  };

  // Batch download
  const handleBatchDownload = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to download",
        variant: "destructive",
      });
      return;
    }

    // Find the selected documents
    const docsToDownload = documents.filter(doc => 
      selectedDocuments.includes(doc.document_id) && doc.url
    );

    // Download each document
    docsToDownload.forEach(doc => {
      if (doc.url) {
        window.open(doc.url, '_blank');
      }
    });

    toast({
      title: "Downloads initiated",
      description: `Started downloading ${docsToDownload.length} document(s)`,
    });
  };

  // Batch delete
  const handleBatchDelete = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to delete",
        variant: "destructive",
      });
      return;
    }

    if (onBatchDelete) {
      onBatchDelete(selectedDocuments);
      setSelectedDocuments([]);
    }
  };

  // Select all documents
  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      // Deselect all if all are already selected
      setSelectedDocuments([]);
    } else {
      // Select all documents
      setSelectedDocuments(documents.map(doc => doc.document_id));
    }
  };

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

  // Batch operations UI
  const renderBatchActions = () => {
    if (!batchMode) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md border">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleSelectAll}
          className="text-sm"
        >
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
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleBatchMode}
          className="text-sm"
        >
          Exit Batch Mode
        </Button>
      </div>
    );
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

  return (
    <div className="space-y-6">
      {/* Batch Mode Toggle */}
      <div className="flex justify-end mb-2">
        <Button 
          variant={batchMode ? "default" : "outline"} 
          size="sm"
          onClick={toggleBatchMode}
          className={batchMode ? "bg-[#0485ea] hover:bg-[#0375d1]" : ""}
        >
          {batchMode ? 'Exit Batch Mode' : 'Batch Operations'}
        </Button>
      </div>
      
      {/* Batch Actions Bar */}
      {renderBatchActions()}

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
                  <div key={document.document_id} className="relative">
                    {/* Checkbox for batch selection */}
                    {batchMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedDocuments.includes(document.document_id)}
                          onCheckedChange={() => handleToggleSelection(document.document_id)}
                          className="bg-white border-gray-300"
                        />
                      </div>
                    )}
                    <DocumentPreviewCard
                      document={document}
                      onView={() => handleViewDocument(document)}
                      onDelete={onDocumentDelete && !batchMode ? () => onDocumentDelete(document) : undefined}
                      showEntityInfo={showEntityInfo}
                      isSelected={selectedDocuments.includes(document.document_id)}
                      batchMode={batchMode}
                      showNavigationButton={showNavigationButtons}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })
      ) : (
        // Show documents without categories, add showNavigationButton prop
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div key={document.document_id} className="relative">
              {/* Checkbox for batch selection */}
              {batchMode && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox
                    checked={selectedDocuments.includes(document.document_id)}
                    onCheckedChange={() => handleToggleSelection(document.document_id)}
                    className="bg-white border-gray-300"
                  />
                </div>
              )}
              <DocumentPreviewCard
                key={document.document_id}
                document={document}
                onView={() => handleViewDocument(document)}
                onDelete={onDocumentDelete && !batchMode ? () => onDocumentDelete(document) : undefined}
                showEntityInfo={showEntityInfo}
                isSelected={selectedDocuments.includes(document.document_id)}
                batchMode={batchMode}
                showNavigationButton={showNavigationButtons}
              />
            </div>
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
