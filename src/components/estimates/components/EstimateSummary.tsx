import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';

const EstimateSummary = () => {
  const {
    subtotal,
    totalCost,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    grandTotal,
    hasError,
    errorMessage,
  } = useSummaryCalculations();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card className="bg-[#0485ea]/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {hasError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage || 'There was an error calculating the estimate totals'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-medium">{formatCurrency(totalCost)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Gross Margin:</span>
              <span className="font-medium">{formatCurrency(totalGrossMargin)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Margin %:</span>
              <span
                className={`font-medium ${
                  overallMarginPercentage < 15
                    ? 'text-red-600'
                    : overallMarginPercentage > 30
                      ? 'text-green-600'
                      : ''
                }`}
              >
                {overallMarginPercentage.toFixed(1)}%
              </span>
            </div>

            {contingencyAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Contingency:</span>
                <span className="font-medium">{formatCurrency(contingencyAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="text-lg font-bold text-[#0485ea]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateSummary;
