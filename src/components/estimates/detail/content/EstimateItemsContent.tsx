
import React from 'react';
import EstimateItems from '../../EstimateItems';

interface EstimateItemsContentProps {
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
  subtotal: number;
  contingencyAmount?: number;
  contingencyPercentage?: number;
  total: number;
}

const EstimateItemsContent: React.FC<EstimateItemsContentProps> = ({ 
  items, 
  subtotal,
  contingencyAmount,
  contingencyPercentage,
  total
}) => {
  return (
    <>
      <EstimateItems items={items} />
      
      <div className="flex justify-end mt-4">
        <div className="w-64">
          <div className="flex justify-between py-2 text-sm">
            <span>Subtotal:</span>
            <span className="font-medium">
              ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          {contingencyAmount && contingencyPercentage && (
            <div className="flex justify-between py-2 text-sm">
              <span>Contingency ({contingencyPercentage}%):</span>
              <span className="font-medium">
                ${contingencyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          
          <div className="flex justify-between py-2 text-lg font-bold border-t">
            <span>Total:</span>
            <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default EstimateItemsContent;
