
import React from 'react';
import { useFormContext } from 'react-hook-form';
import SummaryCard from './summary/SummaryCard';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { Badge } from '@/components/ui/badge';
import { PaperclipIcon, FileIcon, FileTextIcon, FileImageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EstimateSummary = () => {
  const {
    totalCost,
    totalMarkup,
    subtotal,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal
  } = useSummaryCalculations();
  
  const form = useFormContext<EstimateFormValues>();
  const estimateDocuments = form.watch('estimate_documents') || [];
  
  // Count documents attached to line items
  const items = form.watch('items') || [];
  const lineItemDocumentsCount = items.filter(item => item.document_id).length;
  
  // Total documents count
  const totalDocumentsCount = estimateDocuments.length + lineItemDocumentsCount;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Estimate Summary</h3>
        
        {totalDocumentsCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 cursor-pointer">
                  <PaperclipIcon className="h-3.5 w-3.5" />
                  <span>{totalDocumentsCount} Document{totalDocumentsCount !== 1 ? 's' : ''}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-1">
                    <FileTextIcon className="h-3.5 w-3.5" />
                    <span>{estimateDocuments.length} estimate document{estimateDocuments.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileIcon className="h-3.5 w-3.5" />
                    <span>{lineItemDocumentsCount} line item document{lineItemDocumentsCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <SummaryCard 
        totalCost={totalCost}
        totalMarkup={totalMarkup}
        subtotal={subtotal}
        totalGrossMargin={totalGrossMargin}
        overallMarginPercentage={overallMarginPercentage}
        contingencyAmount={contingencyAmount}
        grandTotal={grandTotal}
      />
    </div>
  );
};

export default EstimateSummary;
