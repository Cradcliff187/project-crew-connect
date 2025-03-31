
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FileIcon, FileTextIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import DocumentList from '@/components/documents/DocumentList';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

const DocumentsStep = () => {
  const form = useFormContext<EstimateFormValues>();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  
  // Get the temporary ID from the form context or create one if it doesn't exist
  const [tempEstimateId, setTempEstimateId] = useState<string>("");
  
  useEffect(() => {
    // Check if we already have a temp ID stored in the form
    const storedTempId = form.getValues('temp_id');
    
    if (storedTempId) {
      setTempEstimateId(storedTempId);
    } else {
      // Create a new temp ID if we don't have one
      const newTempId = "temp-" + Math.random().toString(36).substr(2, 9);
      setTempEstimateId(newTempId);
      // Store it in the form for future reference
      form.setValue('temp_id', newTempId);
    }
  }, [form]);
  
  const { 
    documents, 
    loading, 
    error, 
    refetchDocuments 
  } = useEstimateDocuments(tempEstimateId);

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

  // Handle button click - prevent propagation to parent form
  const handleAddDocumentClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event bubbling
    setIsDocumentUploadOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Supporting Documents</h3>
        <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
          <Button 
            onClick={handleAddDocumentClick}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
            type="button" // Explicitly set as button type, not submit
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Document
          </Button>
          
          <SheetContent className="w-[90vw] sm:max-w-[600px] p-0" aria-describedby="document-upload-description">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle>Add Document to Estimate</SheetTitle>
              <SheetDescription id="document-upload-description">
                Upload files to attach to this estimate.
              </SheetDescription>
            </SheetHeader>
            
            {tempEstimateId && (
              <EnhancedDocumentUpload 
                entityType="ESTIMATE"
                entityId={tempEstimateId}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setIsDocumentUploadOpen(false)}
              />
            )}
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
