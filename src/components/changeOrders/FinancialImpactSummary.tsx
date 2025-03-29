
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ChangeOrder } from '@/types/changeOrders';

interface FinancialImpactSummaryProps {
  changeOrder: ChangeOrder;
  originalContractValue?: number;
}

const FinancialImpactSummary: React.FC<FinancialImpactSummaryProps> = ({ 
  changeOrder, 
  originalContractValue = 0 
}) => {
  // Calculate percentage impact if original contract value is provided
  const percentageImpact = originalContractValue > 0 
    ? (changeOrder.total_amount / originalContractValue) * 100 
    : 0;
  
  // Determine impact severity based on percentage
  const getImpactSeverity = (percentage: number) => {
    if (percentage >= 10) return { color: 'text-red-500', level: 'High' };
    if (percentage >= 5) return { color: 'text-amber-500', level: 'Medium' };
    return { color: 'text-green-500', level: 'Low' };
  };
  
  const impact = getImpactSeverity(percentageImpact);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Financial Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="bg-[#0485ea]/10 p-2 rounded-full mr-3">
              <DollarSign className="h-5 w-5 text-[#0485ea]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Change Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(changeOrder.total_amount)}</p>
            </div>
          </div>
          
          {originalContractValue > 0 && (
            <div className="flex items-center">
              <div className="bg-[#0485ea]/10 p-2 rounded-full mr-3">
                <TrendingUp className="h-5 w-5 text-[#0485ea]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impact Percentage</p>
                <p className="text-lg font-semibold">{percentageImpact.toFixed(2)}%</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="bg-[#0485ea]/10 p-2 rounded-full mr-3">
              <CreditCard className="h-5 w-5 text-[#0485ea]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Contract Value</p>
              <p className="text-lg font-semibold">{formatCurrency(originalContractValue + changeOrder.total_amount)}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`bg-${impact.color.replace('text-', '')}/10 p-2 rounded-full mr-3`}>
              <AlertCircle className={`h-5 w-5 ${impact.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Impact Severity</p>
              <p className={`text-lg font-semibold ${impact.color}`}>{impact.level}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialImpactSummary;
