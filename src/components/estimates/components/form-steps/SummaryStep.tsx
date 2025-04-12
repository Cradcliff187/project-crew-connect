
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { useSummaryCalculations } from '../../hooks/useSummaryCalculations';
import { useEstimateDocuments } from '../../../documents/hooks/useEstimateDocuments';
import { PaperclipIcon, FileIcon } from 'lucide-react';
import DocumentList from '@/components/documents/DocumentList';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const SummaryStep = memo(() => {
  const form = useFormContext<EstimateFormValues>();
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [attachedItemDocuments, setAttachedItemDocuments] = useState<Record<string, {file_name?: string, file_type?: string}>>({});
  
  const {
    totalCost,
    totalMarkup,
    subtotal,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal
  } = useSummaryCalculations();

  // Get tempId only once, don't watch it
  const tempEstimateId = form.getValues('temp_id') || '';
  
  // Get items only when needed, don't watch the entire form
  const items = form.getValues('items') || [];
  const estimateDocuments = form.getValues('estimate_documents') || [];
  
  const { 
    documents, 
    loading, 
    refetchDocuments 
  } = useEstimateDocuments(tempEstimateId);

  // Load document info for items that have attached documents
  useEffect(() => {
    const itemsWithDocs = items.filter(item => item.document_id);

    const fetchDocumentInfo = async () => {
      if (itemsWithDocs.length === 0) return;
      
      const docInfo: Record<string, {file_name?: string, file_type?: string}> = {};
      
      for (const item of itemsWithDocs) {
        if (!item.document_id) continue;
        
        try {
          const { data, error } = await supabase
            .from('documents')
            .select('file_name, file_type')
            .eq('document_id', item.document_id)
            .single();
            
          if (error) {
            console.error('Error fetching document:', error);
            continue;
          }
          
          docInfo[item.document_id] = data;
        } catch (err) {
          console.error('Error in document fetch:', err);
        }
      }
      
      setAttachedItemDocuments(docInfo);
    };
    
    fetchDocumentInfo();
  }, [items]);

  const handleDocumentUploadSuccess = useCallback((documentId?: string) => {
    setIsDocumentUploadOpen(false);
    
    if (documentId) {
      const currentDocuments = form.getValues('estimate_documents') || [];
      // Use setValue with options to minimize re-renders
      form.setValue('estimate_documents', [...currentDocuments, documentId], {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      });
      
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
      currentDocuments.filter(id => id !== document.document_id),
      {
        shouldDirty: true,
        shouldTouch: false,
        shouldValidate: false,
      }
    );
    
    toast({
      title: 'Document removed',
      description: 'Document has been removed from the estimate',
    });
    
    refetchDocuments();
  }, [form, refetchDocuments]);

  const handleOpenUpload = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

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
                        <div className="flex items-center">
                          <span>{item.description || `Item ${index + 1}`}</span>
                          {item.document_id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="ml-2 flex items-center gap-1 bg-blue-50">
                                    <PaperclipIcon className="h-3 w-3" />
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-xs">
                                    <div className="font-medium">
                                      {attachedItemDocuments[item.document_id]?.file_name || 'Document attached'}
                                    </div>
                                    <div className="text-muted-foreground">
                                      {attachedItemDocuments[item.document_id]?.file_type || ''}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
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
                  <td className="py-2">Contingency ({form.getValues('contingency_percentage')}%)</td>
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
          <CardTitle className="text-lg font-medium">
            Supporting Documents 
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
              {estimateDocuments.length + items.filter(item => item.document_id).length}
            </Badge>
          </CardTitle>
          <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
            <SheetTrigger asChild>
              <Button 
                className="bg-[#0485ea] hover:bg-[#0373ce]"
                type="button"
                onClick={handleOpenUpload}
              >
                <PaperclipIcon className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </SheetTrigger>
            
            <SheetContent 
              className="w-[90vw] sm:max-w-[600px] p-0" 
              aria-describedby="document-upload-description"
              onClick={(e) => e.stopPropagation()}
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
        </CardHeader>
        
        <CardContent>
          <DocumentList
            documents={documents}
            loading={loading}
            onUploadClick={() => setIsDocumentUploadOpen(true)}
            onDocumentDelete={handleDocumentDelete}
            emptyMessage="No documents attached yet. Add supporting documents like contracts, specifications, or reference materials."
            showEntityInfo={false}
            showCategories={true}
          />
          
          {items.filter(item => item.document_id).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Line Item Attachments:</h4>
              <div className="border rounded-md divide-y">
                {items.filter(item => item.document_id).map((item, index) => {
                  const docInfo = item.document_id ? attachedItemDocuments[item.document_id] : null;
                  
                  return (
                    <div key={`doc-${index}`} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{docInfo?.file_name || 'Document'}</p>
                          <p className="text-xs text-muted-foreground">
                            For: {item.description || `Item ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

SummaryStep.displayName = 'SummaryStep';

export default SummaryStep;
