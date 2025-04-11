import React, { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { UploadIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DocumentList } from '@/components/documents';
import { EntityType } from '@/components/documents/schemas/documentSchema';

const SummaryStep = () => {
  const form = useFormContext<EstimateFormValues>();
  const { watch, setValue } = form;
  const tempId = watch('temp_id');
  const documentIds = watch('estimate_documents') || [];
  
  const [showDocumentUpload, setShowDocumentUpload] = React.useState(false);
  const { 
    documents: attachedDocuments, 
    loading,
    refetchDocuments: fetchAttachedDocuments 
  } = useEstimateDocuments(tempId);
  
  const handleDocumentUploadSuccess = useCallback((documentId?: string) => {
    setShowDocumentUpload(false);
    
    if (documentId) {
      const updatedDocumentIds = [...documentIds, documentId];
      setValue('estimate_documents', updatedDocumentIds, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
      
      fetchAttachedDocuments();
    }
  }, [documentIds, setValue, fetchAttachedDocuments]);
  
  const handleRemoveDocument = useCallback((document: any) => {
    const updatedDocumentIds = documentIds.filter(id => id !== document.document_id);
    setValue('estimate_documents', updatedDocumentIds, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
    
    fetchAttachedDocuments();
  }, [documentIds, setValue, fetchAttachedDocuments]);
  
  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <Card className="border border-[#0485ea]/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Summary & Documents</CardTitle>
        <Sheet open={showDocumentUpload} onOpenChange={setShowDocumentUpload}>
          <Button 
            onClick={() => setShowDocumentUpload(true)}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
            type="button"
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Add Document
          </Button>
          
          <SheetContent 
            className="w-[90vw] sm:max-w-[600px] p-0" 
            aria-describedby="document-upload-description"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => e.stopPropagation()}
          >
            <SheetHeader className="p-6 pb-2">
              <SheetTitle>Add Document to Estimate</SheetTitle>
              <SheetDescription id="document-upload-description">
                Upload files to attach to this estimate.
              </SheetDescription>
            </SheetHeader>
            
            {tempId && (
              <EnhancedDocumentUpload
                entityType={EntityType.ESTIMATE}
                entityId={tempId}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setShowDocumentUpload(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      </CardHeader>
      
      <CardContent>
        {documentIds.length > 0 && (
          <div className="mt-6">
            <DocumentList
              documents={attachedDocuments}
              loading={loading}
              onViewDocument={handleViewDocument}
              onDocumentDelete={handleRemoveDocument}
              emptyMessage="No documents attached to this estimate"
              showEntityInfo={false}
              showCategories={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryStep;
