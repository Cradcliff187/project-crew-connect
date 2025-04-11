import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import DocumentList from '@/components/documents/DocumentList';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EntityType } from '@/components/documents/schemas/documentSchema';

const DocumentsStep = () => {
  const form = useFormContext<EstimateFormValues>();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  
  const [tempEstimateId, setTempEstimateId] = useState<string>("");
  
  useEffect(() => {
    const storedTempId = form.getValues('temp_id');
    
    if (storedTempId) {
      setTempEstimateId(storedTempId);
    } else {
      const newTempId = "temp-" + Math.random().toString(36).substr(2, 9);
      setTempEstimateId(newTempId);
      form.setValue('temp_id', newTempId);
    }
  }, [form]);
  
  const { 
    documents, 
    loading, 
    error, 
    refetchDocuments 
  } = useEstimateDocuments(tempEstimateId);

  const handleDocumentUploadSuccess = useCallback((documentId?: string) => {
    setIsDocumentUploadOpen(false);
    
    if (documentId) {
      const currentDocuments = form.getValues('estimate_documents') || [];
      form.setValue('estimate_documents', [...currentDocuments, documentId]);
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
      
      refetchDocuments();
    }
  }, [form, refetchDocuments]);

  const handleDocumentDelete = useCallback((document: any) => {
    const currentDocuments = form.getValues('estimate_documents') || [];
    form.setValue(
      'estimate_documents', 
      currentDocuments.filter(id => id !== document.document_id)
    );
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
    
    refetchDocuments();
  }, [form, refetchDocuments]);

  const handleAddDocumentClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setIsDocumentUploadOpen(false);
      }, 50);
    } else {
      setIsDocumentUploadOpen(true);
    }
  }, []);

  return (
    <Card className="border border-[#0485ea]/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Supporting Documents</CardTitle>
        <Sheet open={isDocumentUploadOpen} onOpenChange={handleSheetOpenChange}>
          <Button 
            onClick={handleAddDocumentClick}
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
            
            {tempEstimateId && (
              <EnhancedDocumentUpload 
                entityType={EntityType.ESTIMATE}
                entityId={tempEstimateId}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setIsDocumentUploadOpen(false)}
                preventFormPropagation={true}
              />
            )}
          </SheetContent>
        </Sheet>
      </CardHeader>
      
      <CardContent>
        <DocumentList
          documents={documents}
          loading={loading}
          onViewDocument={(doc) => window.open(doc.url, '_blank')}
          onDocumentDelete={handleDocumentDelete}
          emptyMessage="No documents attached yet. Add supporting documents like contracts, specifications, or reference materials."
        />
        
        {error && (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 text-sm mt-4">
            Error loading documents: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsStep;
