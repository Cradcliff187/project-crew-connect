import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

import DocumentFilters from '@/components/documents/DocumentFilters';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import DocumentViews from '@/components/documents/DocumentViews';
import DocumentDetailView from '@/components/documents/DocumentDetailView';
import DeleteConfirmation from '@/components/documents/DeleteConfirmation';
import PageHeader from '@/components/layout/PageHeader';
import RecentDocumentsSection from '@/components/documents/RecentDocumentsSection';

import { useDocuments } from '@/components/documents/hooks/useDocuments';
import { useDocumentActions } from '@/components/documents/hooks/useDocumentActions';
import { useRecentDocuments } from '@/components/documents/hooks/useRecentDocuments';
import { Document, EntityType } from '@/components/documents/schemas/documentSchema';

const DocumentsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [selectedEntityType, setSelectedEntityType] = useState<EntityType>('PROJECT');
  
  const { 
    documents,
    loading,
    filters,
    activeFiltersCount,
    handleFilterChange,
    handleResetFilters,
    fetchDocuments
  } = useDocuments({
    search: '',
    category: undefined,
    entityType: undefined,
    isExpense: undefined,
    dateRange: undefined,
    sortBy: 'newest'
  });
  
  const {
    selectedDocument,
    isDetailOpen,
    isDeleteOpen,
    isUploadOpen,
    deleteError,
    hasReferences,
    batchDeleteLoading,
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleForceDelete,
    handleUploadSuccess,
    handleBatchDelete
  } = useDocumentActions(fetchDocuments);

  const { 
    recentDocuments, 
    recentDocumentsLoading, 
    refreshRecentDocuments 
  } = useRecentDocuments();

  const handleDocumentUploadSuccess = () => {
    handleUploadSuccess();
    refreshRecentDocuments();
  };
  
  const handleViewRelatedDocument = (document: Document) => {
    setIsDetailOpen(false);
    setTimeout(() => {
      handleDocumentSelect(document);
    }, 100);
  };

  const handleEntityTypeChange = (type: EntityType) => {
    setSelectedEntityType(type);
  };

  const totalDocuments = documents?.length || 0;

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Documents"
          description={`${totalDocuments} documents in your repository`}
        >
          <div className="flex-1"></div>
          <Button 
            className="bg-[#0485ea] hover:bg-[#0375d1]" 
            size={isMobile ? "icon" : "default"}
            onClick={() => setIsUploadOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && <span>Add Document</span>}
          </Button>
        </PageHeader>

        <Separator className="my-6" />
        
        <RecentDocumentsSection 
          documents={recentDocuments}
          loading={recentDocumentsLoading}
          onViewDocument={handleDocumentSelect}
          showNavigationButtons
        />
        
        <DocumentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        <div className="space-y-4 mt-6">
          <DocumentViews 
            documents={documents}
            loading={loading}
            activeFiltersCount={activeFiltersCount}
            onView={handleDocumentSelect}
            onDelete={handleDeleteDialogOpen}
            onBatchDelete={handleBatchDelete}
            onUploadClick={() => setIsUploadOpen(true)}
            showNavigationButtons
          />
        </div>

        <DocumentDetailView 
          document={selectedDocument}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onDelete={() => {
            setIsDetailOpen(false);
            handleDeleteDialogOpen(selectedDocument!);
          }}
          onViewRelatedDocument={handleViewRelatedDocument}
        />

        <DeleteConfirmation 
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteDocument}
          onForceDelete={handleForceDelete}
          error={deleteError}
          hasReferences={hasReferences}
        />

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className={isMobile ? "w-[95vw] max-w-[600px]" : "sm:max-w-[600px]"}>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload and categorize a new document to your system.
              </DialogDescription>
            </DialogHeader>
            <EnhancedDocumentUpload 
              onSuccess={handleDocumentUploadSuccess}
              onCancel={() => setIsUploadOpen(false)}
              allowEntityTypeSelection={true}
              entityType={selectedEntityType}
              onEntityTypeChange={handleEntityTypeChange}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default DocumentsPage;
