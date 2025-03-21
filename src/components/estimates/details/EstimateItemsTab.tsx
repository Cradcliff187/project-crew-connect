
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateItemsTab;
