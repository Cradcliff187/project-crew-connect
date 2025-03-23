
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';

interface EstimatePreviewProps {
  formData: EstimateFormValues;
  selectedCustomerName: string | null;
  selectedCustomerAddress: string | null;
}

const EstimatePreview: React.FC<EstimatePreviewProps> = ({ 
  formData, 
  selectedCustomerName,
  selectedCustomerAddress 
}) => {
  const {
    totalCost,
    totalMarkup,
    subtotal,
    contingencyAmount,
    grandTotal
  } = useSummaryCalculations();

  const formatAddress = () => {
    if (formData.showSiteLocation || !selectedCustomerAddress) {
      const { address, city, state, zip } = formData.location;
      return address && city ? `${address}, ${city}, ${state || ''} ${zip || ''}`.trim() : 'No address provided';
    } else {
      return selectedCustomerAddress || 'No address provided';
    }
  };

  const getCustomerName = () => {
    if (formData.isNewCustomer && formData.newCustomer?.name) {
      return formData.newCustomer.name;
    }
    return selectedCustomerName || 'No customer selected';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#0485ea]">Estimate Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Project</h3>
              <p className="text-base">{formData.project}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">Customer</h3>
              <p className="text-base">{getCustomerName()}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">Description</h3>
            <p className="text-base whitespace-pre-line">{formData.description || 'No description provided'}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">Site Location</h3>
            <p className="text-base">{formatAddress()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-[#0485ea]">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-2">Description</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Cost</th>
                  <th className="pb-2 text-right">Markup %</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const cost = parseFloat(item.cost) || 0;
                  const qty = parseFloat(item.quantity || '1') || 1;
                  const markup = parseFloat(item.markup_percentage) || 0;
                  const total = cost * (1 + markup / 100) * qty;
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 capitalize">{item.item_type}</td>
                      <td className="py-3 text-right">{qty}</td>
                      <td className="py-3 text-right">${cost.toFixed(2)}</td>
                      <td className="py-3 text-right">{markup}%</td>
                      <td className="py-3 text-right">${total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Contingency ({formData.contingency_percentage}%):</span>
              <span>${contingencyAmount.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-700">
          <strong>Note:</strong> This is a preview of your estimate. When you submit, a document record will be created and the estimate will be saved in your system.
        </p>
      </div>
    </div>
  );
};

export default EstimatePreview;
