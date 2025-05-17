import React from 'react';
import EstimateItems from '../../EstimateItems';
import { calcMarkup } from '@/utils/finance';

interface EstimateItemsContentProps {
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    cost?: number;
    markup_percentage?: number;
    markup_amount?: number;
    gross_margin?: number;
    gross_margin_percentage?: number;
  }[];
  subtotal: number;
  contingencyAmount?: number;
  contingencyPercentage?: number;
  total: number;
  showFinancialDetails?: boolean;
}

const EstimateItemsContent: React.FC<EstimateItemsContentProps> = ({
  items,
  subtotal,
  contingencyAmount,
  contingencyPercentage,
  total,
  showFinancialDetails = false,
}) => {
  // Calculate total costs and margins for financial summary
  const totalCost = items.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
  const totalMarkup = items.reduce((sum, item) => {
    const itemCost = (item.cost || 0) * item.quantity;
    const markupPercentage = item.markup_percentage || 0;
    const { markupAmt } = calcMarkup(itemCost, markupPercentage);
    return sum + markupAmt;
  }, 0);
  const totalMargin = subtotal - totalCost;
  const marginPercentage = subtotal > 0 ? (totalMargin / subtotal) * 100 : 0;

  return (
    <>
      <EstimateItems items={items} showFinancialDetails={showFinancialDetails} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {showFinancialDetails && (
          <div className="md:col-span-2">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-sm font-semibold mb-2 text-[#0485ea]">Financial Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="font-medium">
                    ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Markup</p>
                  <p className="font-medium">
                    ${totalMarkup.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gross Margin</p>
                  <p className="font-medium">
                    ${totalMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Margin %</p>
                  <p
                    className={`font-medium ${marginPercentage < 20 ? 'text-red-600' : marginPercentage > 30 ? 'text-green-600' : ''}`}
                  >
                    {marginPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`${showFinancialDetails ? 'md:col-span-1' : 'md:col-span-3'}`}>
          <div className="border rounded-md p-3 bg-gray-50">
            <div className="flex justify-between py-2 text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {contingencyAmount !== undefined && contingencyPercentage !== undefined && (
              <div className="flex justify-between py-2 text-sm">
                <span>Contingency ({contingencyPercentage}%):</span>
                <span className="font-medium">
                  ${contingencyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 text-lg font-bold border-t mt-1 pt-2">
              <span>Total:</span>
              <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EstimateItemsContent;
