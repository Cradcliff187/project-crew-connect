
import React from 'react';
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

import { useDocuments } from '@/components/documents/hooks/useDocuments';
import { useDocumentActions } from '@/components/documents/hooks/useDocumentActions';
import { FilterOptions } from '@/components/documents/hooks/useDocuments';

const DocumentsPage: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Use the custom hook for document state management
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
  
  // Use the custom hook for document actions
  const {
    selectedDocument,
    isDetailOpen,
    isDeleteOpen,
    isUploadOpen,
    deleteError,
    hasReferences,
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleForceDelete,
    handleUploadSuccess
  } = useDocumentActions(fetchDocuments);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Documents"
          description="Upload and manage documents for your projects"
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
        
        {/* Unified Filter Area */}
        <DocumentFilters
          filters={filters as FilterOptions}
          onFilterChange={(key, value) => handleFilterChange(key as keyof FilterOptions, value)}
          onReset={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Documents Content Area */}
        <div className="space-y-4 mt-6">
          <DocumentViews 
            documents={documents}
            loading={loading}
            activeFiltersCount={activeFiltersCount}
            onView={handleDocumentSelect}
            onDelete={handleDeleteDialogOpen}
            onUploadClick={() => setIsUploadOpen(true)}
          />
        </div>

        {/* Document Detail Dialog */}
        <DocumentDetailView 
          document={selectedDocument}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onDelete={() => {
            setIsDetailOpen(false);
            handleDeleteDialogOpen(selectedDocument!);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation 
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteDocument}
          onForceDelete={handleForceDelete}
          error={deleteError}
          hasReferences={hasReferences}
        />

        {/* Upload Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className={isMobile ? "w-[95vw] max-w-[600px]" : "sm:max-w-[600px]"}>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload and categorize a new document to your system.
              </DialogDescription>
            </DialogHeader>
            <EnhancedDocumentUpload 
              entityType="PROJECT" 
              onSuccess={handleUploadSuccess}
              onCancel={() => setIsUploadOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default DocumentsPage;
