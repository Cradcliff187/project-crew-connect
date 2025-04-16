import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSummaryCalculations } from '../hooks/useSummaryCalculations';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PaperclipIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';

interface EstimateSummaryProps {
  showContingencyControls?: boolean;
  documents?: Array<{
    file_name?: string;
    file_type?: string;
  }>;
}

const EstimateSummary: React.FC<EstimateSummaryProps> = ({
  showContingencyControls = false,
  documents = [],
}) => {
  const {
    subtotal,
    totalCost,
    totalGrossMargin,
    overallMarginPercentage,
    contingencyAmount,
    contingencyPercentage,
    setContingencyPercentage,
    grandTotal,
    hasError,
    errorMessage,
  } = useSummaryCalculations();

  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleContingencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setContingencyPercentage(value);
  };

  return (
    <>
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
            <span className="font-medium text-right">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Cost:</span>
            <span className="font-medium text-right">{formatCurrency(totalCost)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Gross Margin:</span>
            <div className="flex items-center">
              <Badge
                variant="outline"
                className={`text-xs mr-2 ${
                  overallMarginPercentage < 15
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : overallMarginPercentage > 30
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-gray-50'
                }`}
              >
                {overallMarginPercentage.toFixed(1)}%
              </Badge>
              <span className="font-medium text-right">{formatCurrency(totalGrossMargin)}</span>
            </div>
          </div>

          {showContingencyControls ? (
            <div className="space-y-2 mt-2 pt-3 border-t">
              <div>
                <Label htmlFor="contingencyPercentage" className="text-sm block mb-1">
                  Contingency %
                </Label>
              </div>
              <div className="flex items-center justify-between">
                <Input
                  id="contingencyPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-32 h-8 text-right text-sm"
                  value={contingencyPercentage}
                  onChange={handleContingencyChange}
                />
                <span className="text-sm font-medium">{formatCurrency(contingencyAmount)}</span>
              </div>
            </div>
          ) : (
            contingencyAmount > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Contingency:</span>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs mr-2">
                    {contingencyPercentage}%
                  </Badge>
                  <span className="font-medium text-right">
                    {formatCurrency(contingencyAmount)}
                  </span>
                </div>
              </div>
            )
          )}

          <div className="pt-2 border-t mt-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="text-lg font-bold text-[#0485ea] text-right">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {documents && documents.length > 0 && (
            <Collapsible
              open={isDocsOpen}
              onOpenChange={setIsDocsOpen}
              className="pt-2 border-t mt-2"
            >
              <CollapsibleTrigger className="flex justify-between items-center w-full text-sm">
                <span className="text-muted-foreground">Documents ({documents.length}):</span>
                {isDocsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded border border-muted hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center">
                        <PaperclipIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[160px]">
                          {doc.file_name || `Document ${index + 1}`}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {doc.file_type || 'File'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </>
  );
};

export default EstimateSummary;
