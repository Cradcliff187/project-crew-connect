
import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog";

import { DocumentFilters } from '@/components/documents/DocumentFilters';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import DocumentViews from '@/components/documents/DocumentViews';
import DocumentDetailView from '@/components/documents/DocumentDetailView';
import DeleteConfirmation from '@/components/documents/DeleteConfirmation';
import PageHeader from '@/components/layout/PageHeader';
import { toast } from '@/hooks/use-toast';

import { useDocuments } from '@/components/documents/hooks/useDocuments';
import { useDocumentActions } from '@/components/documents/hooks/useDocumentActions';
import { testBucketAccess } from '@/components/documents/services/BucketTest';
import { getStorageBucket } from '@/integrations/supabase/client';

const DocumentsPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [bucketStatus, setBucketStatus] = useState<{checked: boolean, ready: boolean}>({
    checked: false,
    ready: false
  });
  
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

  // Check bucket on component mount - simplified approach
  useEffect(() => {
    const checkBucketStatus = async () => {
      try {
        // Get the bucket directly without checking if it exists
        const { success, error } = await getStorageBucket();
        
        if (!success) {
          console.error('Storage access issue:', error);
          toast({
            title: 'Storage Configuration Issue',
            description: 'Document storage is not properly configured. Please contact support.',
            variant: 'destructive',
          });
          setBucketStatus({checked: true, ready: false});
          return;
        }
        
        setBucketStatus({checked: true, ready: true});
      } catch (error) {
        console.error('Error checking bucket status:', error);
        setBucketStatus({checked: true, ready: false});
      }
    };
    
    checkBucketStatus();
  }, []);

  // Run bucket test on demand and log results
  const runBucketTest = async () => {
    const result = await testBucketAccess();
    console.log('Bucket Test Result:', result);
    
    if (result.success) {
      toast({
        title: 'Bucket Check Successful',
        description: `Storage access confirmed for: ${result.bucketName}`,
        variant: 'default',
      });
      setBucketStatus({checked: true, ready: true});
    } else {
      toast({
        title: 'Bucket Check Failed',
        description: result.error || 'Unknown error checking storage access',
        variant: 'destructive',
      });
      setBucketStatus({checked: true, ready: false});
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Documents"
          description="Upload and manage documents for your projects"
        >
          <div className="flex-1"></div>
          <Button 
            className="mr-2 bg-gray-500 hover:bg-gray-600" 
            size={isMobile ? "icon" : "default"}
            onClick={runBucketTest}
            variant="outline"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {!isMobile && <span>Test Storage</span>}
          </Button>
          <Button 
            className="bg-[#0485ea] hover:bg-[#0375d1]" 
            size={isMobile ? "icon" : "default"}
            onClick={() => setIsUploadOpen(true)}
            disabled={!bucketStatus.ready}
          >
            <Plus className="h-4 w-4" />
            {!isMobile && <span>Add Document</span>}
          </Button>
        </PageHeader>

        <Separator className="my-6" />
        
        {/* Storage Status Alert */}
        {bucketStatus.checked && !bucketStatus.ready && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <div>
                <h3 className="font-medium">Storage Access Issue</h3>
                <p className="text-sm">
                  Document storage is not accessible. Document uploads and viewing may not work.
                  Please verify your Supabase storage configuration and permissions.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Unified Filter Area */}
        <DocumentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
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

        {/* Dialog components */}
        <DocumentDetailView 
          document={selectedDocument}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onDelete={() => {
            setIsDetailOpen(false);
            handleDeleteDialogOpen(selectedDocument!);
          }}
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
