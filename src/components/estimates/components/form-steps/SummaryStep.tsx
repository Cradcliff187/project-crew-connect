
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { useSummaryCalculations } from '../../hooks/useSummaryCalculations';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import { PaperclipIcon, FileIcon } from 'lucide-react';
import DocumentList from '@/components/documents/DocumentList';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';

const SummaryStep = () => {
  const form = useFormContext<EstimateFormValues>();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  
  const {
    totalCost,
    totalMarkup,
    subtotal,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal
  } = useSummaryCalculations();

  const tempEstimateId = form.getValues('temp_id') || '';
  
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
      
      toast({
        title: 'Document attached',
        description: 'Document has been attached to the estimate',
      });
      
      // Refresh the document list
      refetchDocuments();
    }
  };

  const items = form.watch('items') || [];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Estimate Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Cost</th>
                  <th className="text-right py-2">Markup</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Margin</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const cost = parseFloat(item.cost) || 0;
                  const markup = cost * (parseFloat(item.markup_percentage) / 100);
                  const price = cost + markup;
                  const quantity = parseFloat(item.quantity) || 1;
                  const totalPrice = price * quantity;
                  const margin = markup * quantity;
                  const marginPercentage = price > 0 ? (markup / price) * 100 : 0;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-2 text-sm">
                        {item.description || `Item ${index + 1}`}
                        {item.document_id && (
                          <span className="ml-2 text-blue-500">
                            <PaperclipIcon className="h-3 w-3 inline" />
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right text-sm">${(cost * quantity).toFixed(2)}</td>
                      <td className="py-2 text-right text-sm">${(markup * quantity).toFixed(2)}</td>
                      <td className="py-2 text-right text-sm">${totalPrice.toFixed(2)}</td>
                      <td className="py-2 text-right text-sm">{marginPercentage.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-medium bg-gray-50">
                  <td className="py-2">Subtotal</td>
                  <td className="py-2 text-right">${totalCost.toFixed(2)}</td>
                  <td className="py-2 text-right">${totalMarkup.toFixed(2)}</td>
                  <td className="py-2 text-right">${subtotal.toFixed(2)}</td>
                  <td className="py-2 text-right">{overallMarginPercentage.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-2">Contingency ({form.watch('contingency_percentage')}%)</td>
                  <td colSpan={3} className="py-2 text-right">${contingencyAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
                <tr className="font-bold text-lg">
                  <td className="py-2">Grand Total</td>
                  <td colSpan={3} className="py-2 text-right">${grandTotal.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Supporting Documents</CardTitle>
          <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
            <SheetTrigger asChild>
              <Button 
                className="bg-[#0485ea] hover:bg-[#0373ce]"
                type="button"
              >
                <PaperclipIcon className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </SheetTrigger>
            
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
        </CardHeader>
        
        <CardContent>
          <DocumentList
            documents={documents}
            loading={loading}
            onUploadClick={() => setIsDocumentUploadOpen(true)}
            onDocumentDelete={(document) => {
              // Remove the document ID from the form values
              const currentDocuments = form.getValues('estimate_documents') || [];
              form.setValue(
                'estimate_documents', 
                currentDocuments.filter(id => id !== document.document_id)
              );
              
              toast({
                title: 'Document removed',
                description: 'Document has been removed from the estimate',
              });
              
              // Refresh the document list
              refetchDocuments();
            }}
            emptyMessage="No documents attached yet. Add supporting documents like contracts, specifications, or reference materials."
            showEntityInfo={false}
            showCategories={true}
          />
          
          {error && (
            <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800 text-sm mt-4">
              Error loading documents: {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryStep;
