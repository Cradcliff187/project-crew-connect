import React, { useState, useCallback, memo, useMemo } from 'react';
import EstimateItemFields from '../EstimateItemFields';
import EstimateSummary from '../EstimateSummary';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useFormContext } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, UploadIcon } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import ContingencyInput from '../summary/ContingencyInput';

// Memoize the component to prevent unnecessary re-renders
const LineItemsStep = memo(() => {
  const form = useFormContext<EstimateFormValues>();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);

  // Use useMemo to get temp ID only once and prevent re-renders
  const tempEstimateId = useMemo(() => {
    return form.getValues('temp_id') || '';
  }, [form]);

  const { documents, refetchDocuments } = useEstimateDocuments(tempEstimateId);

  // Memoize handlers to prevent re-creation on each render
  const handleDocumentUploadSuccess = useCallback(
    (documentId?: string) => {
      setIsDocumentUploadOpen(false);

      if (documentId) {
        // Add the document ID to the form values
        const currentDocuments = form.getValues('estimate_documents') || [];
        form.setValue('estimate_documents', [...currentDocuments, documentId], {
          // Only mark as dirty, don't trigger validation or rerender
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false,
        });

        toast({
          title: 'Document attached',
          description: 'Document has been attached to the estimate',
        });

        // Refresh the document list
        refetchDocuments();
      }
    },
    [form, refetchDocuments]
  );

  const handleOpenDocumentUpload = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <EstimateItemFields />

        {/* Add the contingency input in a card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Contingency</CardTitle>
          </CardHeader>
          <CardContent>
            <ContingencyInput />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <EstimateSummary />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              Supporting Documents
              <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
                <SheetTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-[#0485ea] hover:bg-[#0373ce]"
                    type="button"
                    onClick={handleOpenDocumentUpload}
                  >
                    <UploadIcon className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                </SheetTrigger>

                <SheetContent
                  className="w-[90vw] sm:max-w-[600px] p-0"
                  aria-describedby="document-upload-description"
                  onClick={e => e.stopPropagation()}
                >
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
                      preventFormPropagation={true}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents && documents.length > 0 ? (
              <div className="text-sm text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? 's' : ''} attached
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No documents attached</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

LineItemsStep.displayName = 'LineItemsStep';

export default LineItemsStep;
