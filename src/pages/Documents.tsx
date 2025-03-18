
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";

import DocumentFilters from '@/components/documents/DocumentFilters';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import DocumentViews from '@/components/documents/DocumentViews';
import DocumentDetailView from '@/components/documents/DocumentDetailView';
import DeleteConfirmation from '@/components/documents/DeleteConfirmation';

import { useDocuments } from '@/components/documents/hooks/useDocuments';
import { useDocumentActions } from '@/components/documents/hooks/useDocumentActions';

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
    setIsUploadOpen,
    setIsDetailOpen,
    setIsDeleteOpen,
    handleDocumentSelect,
    handleDeleteDialogOpen,
    handleDeleteDocument,
    handleUploadSuccess
  } = useDocumentActions(fetchDocuments);

  return (
    <PageTransition>
      <div className="container py-4 md:py-6 space-y-6">
        {/* Header with title and Upload button */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold text-[#0485ea]">Documents</h1>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0485ea] hover:bg-[#0375d1]" size={isMobile ? "icon" : "default"}>
                <Plus className="h-4 w-4" />
                {!isMobile && <span>Add Document</span>}
              </Button>
            </DialogTrigger>
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

        <Separator />
        
        {/* Unified Filter Area */}
        <DocumentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Documents Content Area */}
        <div className="space-y-4">
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
            setIsDeleteOpen(true);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmation 
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteDocument}
        />
      </div>
    </PageTransition>
  );
};

export default DocumentsPage;
