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

  return (
    <div className="space-y-4">
      {/* Brief instructions at the top */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
        <ul className="list-disc pl-5 space-y-1 text-blue-700">
          <li>Add each item or service you're providing in your estimate</li>
          <li>
            Enter your <strong>cost</strong> and <strong>markup %</strong> to calculate the price,
            or enter price directly
          </li>
          <li>The total will calculate automatically based on quantity × price</li>
          <li>Use "Hide Financial Details" to simplify the view if needed</li>
        </ul>
      </div>

      {/* Full-width line items table */}
      <div className="w-full">
        <EstimateItemFields />
      </div>

      {/* Summary section at the bottom */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">Estimate Summary</CardTitle>
          <Button
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0373ce]"
            onClick={() => setIsDocumentUploadOpen(true)}
          >
            <PaperclipIcon className="h-3.5 w-3.5 mr-1" />
            Add Document
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <EstimateSummary documents={documents} showContingencyControls={true} />
        </CardContent>
      </Card>

      {/* Document Upload Sheet */}
      <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
        <SheetContent side="right" className="w-[450px] sm:w-[500px]">
          <SheetHeader className="pb-2">
            <SheetTitle>Add Document to Estimate</SheetTitle>
            <SheetDescription>
              Upload files to attach to this estimate. For line item documents, use the menu in each
              row.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 max-h-[80vh] overflow-y-auto">
            {tempEstimateId && (
              <EnhancedDocumentUpload
                entityType="ESTIMATE"
                entityId={tempEstimateId}
                onSuccess={handleDocumentUploadSuccess}
                onCancel={() => setIsDocumentUploadOpen(false)}
                preventFormPropagation={true}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
});

LineItemsStep.displayName = 'LineItemsStep';

export default LineItemsStep;
