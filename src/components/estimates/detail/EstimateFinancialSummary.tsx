import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, CircleDollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimateFinancialSummaryProps {
  subtotal: number;
  totalCost: number;
  contingencyAmount: number;
  contingencyPercentage: number;
  grandTotal: number;
}

const EstimateFinancialSummary: React.FC<EstimateFinancialSummaryProps> = ({
  subtotal,
  totalCost,
  contingencyAmount,
  contingencyPercentage,
  grandTotal,
}) => {
  // Calculate gross margin
  const grossMargin = subtotal - totalCost;
  const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;

  // Calculate final profit after contingency
  const finalProfit = grandTotal - totalCost;
  const finalProfitPercentage = grandTotal > 0 ? (finalProfit / grandTotal) * 100 : 0;

  // Determine margin status color
  const getMarginColor = (percentage: number) => {
    if (percentage < 15) return 'text-red-600';
    if (percentage >= 15 && percentage < 25) return 'text-amber-600';
    if (percentage >= 25) return 'text-green-600';
    return '';
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <CircleDollarSign className="h-5 w-5 text-[#0485ea] mr-2" />
          <h3 className="font-medium text-lg">Financial Summary</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <div className="text-sm text-gray-500">Base Subtotal</div>
              <div className="text-lg font-medium">{formatCurrency(subtotal)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Direct Costs</div>
              <div className="text-lg font-medium">{formatCurrency(totalCost)}</div>
            </div>

            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center">
                      <div className="text-sm text-gray-500">Gross Margin</div>
                      <Badge
                        className={`ml-2 ${getMarginColor(grossMarginPercentage)}`}
                        variant="outline"
                      >
                        {grossMarginPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Profit margin before contingency</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-lg font-medium">{formatCurrency(grossMargin)}</div>
            </div>

            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center">
                      <div className="text-sm text-gray-500">Contingency</div>
                      <Badge className="ml-2" variant="outline">
                        {contingencyPercentage}%
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Buffer for unexpected costs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-lg font-medium">{formatCurrency(contingencyAmount)}</div>
            </div>
          </div>

          <div className="h-px bg-slate-200 my-2"></div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Grand Total (with contingency)</div>
              <div className="text-xl font-bold text-[#0485ea]">{formatCurrency(grandTotal)}</div>
            </div>

            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center">
                      <div className="text-sm text-gray-500">Final Profit</div>
                      <Badge
                        className={`ml-2 ${getMarginColor(finalProfitPercentage)}`}
                        variant="outline"
                      >
                        {finalProfitPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Profit including contingency</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-lg font-medium">{formatCurrency(finalProfit)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateFinancialSummary;
