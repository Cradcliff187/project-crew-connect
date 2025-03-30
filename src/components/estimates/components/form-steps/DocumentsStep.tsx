
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FileIcon, FileTextIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import DocumentList from '@/components/documents/DocumentList';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

const DocumentsStep = () => {
  const form = useFormContext<EstimateFormValues>();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const estimateId = "temp-" + Math.random().toString(36).substr(2, 9);
  
  const { 
    documents, 
    loading, 
    error, 
    refetchDocuments 
  } = useEstimateDocuments(estimateId);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    setIsDocumentUploadOpen(false);
    
    if (documentId) {
      // Add the document ID to the form values
      const currentDocuments = form.getValues('estimate_documents') || [];
      form.setValue('estimate_documents', [...currentDocuments, documentId]);
      
      // Refresh the document list
      refetchDocuments();
    }
  };

  const handleDocumentDelete = (document: any) => {
    // Remove the document ID from the form values
    const currentDocuments = form.getValues('estimate_documents') || [];
    form.setValue(
      'estimate_documents', 
      currentDocuments.filter(id => id !== document.document_id)
    );
    
    // Refresh the document list
    refetchDocuments();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Supporting Documents</h3>
        <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
          <Button 
            onClick={() => setIsDocumentUploadOpen(true)}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Document
          </Button>
          
          <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle>Add Document to Estimate</SheetTitle>
            </SheetHeader>
            
            <EnhancedDocumentUpload 
              entityType="ESTIMATE"
              entityId={estimateId}
              onSuccess={handleDocumentUploadSuccess}
              onCancel={() => setIsDocumentUploadOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
      
      <DocumentList
        documents={documents}
        loading={loading}
        onUploadClick={() => setIsDocumentUploadOpen(true)}
        onDocumentDelete={handleDocumentDelete}
        emptyMessage="No documents attached yet. Add supporting documents like contracts, specifications, or reference materials."
      />
      
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 text-sm">
          Error loading documents: {error}
        </div>
      )}
    </div>
  );
};

export default DocumentsStep;
