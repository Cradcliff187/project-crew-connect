
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

interface EstimateItem {
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
}

interface EstimateItemsProps {
  items: EstimateItem[];
  showFinancialDetails?: boolean;
}

const EstimateItems: React.FC<EstimateItemsProps> = ({ items, showFinancialDetails = false }) => {
  return (
    <Card className="overflow-hidden border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              {showFinancialDetails && (
                <>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Markup %</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </>
              )}
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.description}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                {showFinancialDetails && (
                  <>
                    <TableCell className="text-right">{formatCurrency(item.cost || 0)}</TableCell>
                    <TableCell className="text-right">{item.markup_percentage?.toFixed(1) || 0}%</TableCell>
                    <TableCell className="text-right">{item.gross_margin_percentage?.toFixed(1) || 0}%</TableCell>
                  </>
                )}
                <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={showFinancialDetails ? 7 : 4} className="text-center py-8 text-gray-500">
                  No items added to this estimate
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default EstimateItems;
