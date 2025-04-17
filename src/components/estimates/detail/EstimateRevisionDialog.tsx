
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFormContext } from 'react-hook-form';

interface EstimateRevisionDialogProps {
  estimateId: string;
  onSubtotalChange?: (subtotal: number) => void;
}

export const EstimateRevisionDialog: React.FC<EstimateRevisionDialogProps> = ({
  estimateId,
  onSubtotalChange
}) => {
  const form = useFormContext();
  
  const handleSubtotalChange = (subtotal: number) => {
    if (onSubtotalChange) {
      onSubtotalChange(subtotal);
    }
  };
  
  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Revision Line Items</DialogTitle>
        <DialogDescription>
          Modify line items for this estimate revision
        </DialogDescription>
      </DialogHeader>
      
      {/* Uncomment and fix when EstimateLineItemsEditor is implemented
      <EstimateLineItemsEditor
        form={form}
        name="lineItems"
        estimateId={estimateId}
        onSubtotalChange={handleSubtotalChange}
        hideFinancialSummary={true}
      />
      */}
    </DialogContent>
  );
};

export default EstimateRevisionDialog;
