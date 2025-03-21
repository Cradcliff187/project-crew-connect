
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import { calculateItemPrice, calculateSubtotal } from '../utils/estimateCalculations';

interface EstimatePreviewDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: EstimateFormValues;
  customerName: string;
  isSubmitting: boolean;
}

const EstimatePreviewDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  formData, 
  customerName,
  isSubmitting 
}: EstimatePreviewDialogProps) => {
  // Calculate totals
  const typedItems: EstimateItem[] = formData.items.map(item => ({
    cost: item.cost,
    markup_percentage: item.markup_percentage,
    quantity: item.quantity,
    item_type: item.item_type
  }));
  
  const subtotal = calculateSubtotal(typedItems);
  const contingency = subtotal * (parseFloat(formData.contingency_percentage || '0') / 100);
  const total = subtotal + contingency;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#0485ea]">
            Estimate Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Project Name</h3>
              <p className="mt-1 text-sm">{formData.project}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer</h3>
              <p className="mt-1 text-sm">{customerName}</p>
            </div>
          </div>

          {formData.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap">{formData.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-sm">
              {formData.location.address && `${formData.location.address}, `}
              {formData.location.city && `${formData.location.city}, `}
              {formData.location.state && `${formData.location.state} `}
              {formData.location.zip && formData.location.zip}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Estimate Items</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Markup</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => {
                    const typedItem: EstimateItem = {
                      cost: item.cost,
                      markup_percentage: item.markup_percentage,
                      quantity: item.quantity || '1'
                    };
                    const totalPrice = calculateItemPrice(typedItem);
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{item.item_type}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity || '1'}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(parseFloat(item.cost))}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.markup_percentage}%</td>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">{formatCurrency(totalPrice)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Subtotal:</span>
              <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {parseFloat(formData.contingency_percentage || '0') > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  Contingency ({formData.contingency_percentage}%):
                </span>
                <span className="text-sm font-medium">{formatCurrency(contingency)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-base font-bold text-gray-700">Total:</span>
              <span className="text-base font-bold text-[#0485ea]">{formatCurrency(total)}</span>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Please review this estimate carefully before submitting. Once submitted, it will be saved as a new estimate record.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button 
            type="button" 
            onClick={onConfirm}
            className="bg-[#0485ea] hover:bg-[#0373ce] text-white font-medium px-6"
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? "Creating..." : "Confirm & Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimatePreviewDialog;
