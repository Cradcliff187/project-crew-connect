
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import EstimateItems from '../EstimateItems';
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateItem } from '../types/estimateTypes';

interface EstimateItemsTabProps {
  items: EstimateItem[];
  itemDocuments?: Record<string, Document[]>;
}

const EstimateItemsTab: React.FC<EstimateItemsTabProps> = ({ items, itemDocuments = {} }) => {
  // Calculate the subtotal, which is the sum of all item total prices
  const subtotal = items.reduce((acc, item) => acc + item.total_price, 0);
  
  // Calculate the total gross margin
  const totalGrossMargin = items.reduce((acc, item) => acc + (item.gross_margin || 0), 0);
  
  // Calculate the overall gross margin percentage
  const overallGrossMarginPercentage = subtotal > 0 
    ? (totalGrossMargin / subtotal) * 100 
    : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No items for this estimate.
          </div>
        ) : (
          <EstimateItems 
            items={items}
            itemDocuments={itemDocuments} 
          />
        )}
        
        <div className="flex justify-end mt-4">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm">
              <span>Subtotal:</span>
              <span className="font-medium">
                ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {totalGrossMargin > 0 && (
              <div className="flex justify-between py-2 text-sm">
                <span>Total Gross Margin:</span>
                <span className="font-medium">
                  ${totalGrossMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  {' '}({overallGrossMarginPercentage.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateItemsTab;
