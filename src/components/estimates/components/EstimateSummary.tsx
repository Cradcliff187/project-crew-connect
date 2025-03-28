
import React from 'react';
import { useFormContext } from 'react-hook-form';
import SummaryCard from './summary/SummaryCard';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { Badge } from '@/components/ui/badge';
import { PaperclipIcon } from 'lucide-react';

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
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
            <PaperclipIcon className="h-3 w-3" />
            <span>{totalDocumentsCount} Document{totalDocumentsCount !== 1 ? 's' : ''}</span>
          </Badge>
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
