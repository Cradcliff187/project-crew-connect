
import React from 'react';
import EstimateItems from '../../EstimateItems';
import { EstimateItem } from '../../types/estimateTypes';

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
}

const EstimateItemsContent: React.FC<EstimateItemsContentProps> = ({ 
  items, 
  subtotal,
  contingencyAmount,
  contingencyPercentage,
  total
}) => {
  // Transform the simplified items to match the EstimateItem type
  const transformedItems: EstimateItem[] = items.map(item => ({
    ...item,
    estimate_id: '', // Adding the required estimate_id property
    // Default values for other required properties in EstimateItem that might be missing
    item_type: 'labor', // Providing a default value for item_type
    cost: item.cost || 0,
    markup_percentage: item.markup_percentage || 0
  }));

  // A no-op onChange handler since this is a read-only view
  const handleItemsChange = (newItems: EstimateItem[]) => {
    // This is intentionally empty as we're just displaying items
    console.log("Items would change to:", newItems);
  };

  return (
    <>
      <EstimateItems items={transformedItems} onChange={handleItemsChange} />
      
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
