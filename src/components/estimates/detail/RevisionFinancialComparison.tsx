
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RevisionFinancialComparisonProps {
  currentItems: EstimateItem[];
  previousItems: EstimateItem[];
  currentRevision: EstimateRevision;
  previousRevision: EstimateRevision;
}

const RevisionFinancialComparison: React.FC<RevisionFinancialComparisonProps> = ({
  currentItems,
  previousItems,
  currentRevision,
  previousRevision
}) => {
  // Calculate financial summaries
  const financial = useMemo(() => {
    // Current revision calculations
    const currentSubtotal = currentItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const currentCost = currentItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const currentMarkup = currentItems.reduce((sum, item) => {
      const itemMarkup = item.markup_amount || (item.cost || 0) * (item.markup_percentage || 0) / 100;
      return sum + itemMarkup;
    }, 0);
    const currentGrossMargin = currentSubtotal - currentCost;
    const currentMarginPercentage = currentSubtotal > 0 ? (currentGrossMargin / currentSubtotal * 100) : 0;
    
    // Previous revision calculations
    const previousSubtotal = previousItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const previousCost = previousItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const previousMarkup = previousItems.reduce((sum, item) => {
      const itemMarkup = item.markup_amount || (item.cost || 0) * (item.markup_percentage || 0) / 100;
      return sum + itemMarkup;
    }, 0);
    const previousGrossMargin = previousSubtotal - previousCost;
    const previousMarginPercentage = previousSubtotal > 0 ? (previousGrossMargin / previousSubtotal * 100) : 0;
    
    // Calculate differences
    const subtotalDiff = currentSubtotal - previousSubtotal;
    const subtotalDiffPercent = previousSubtotal > 0 ? (subtotalDiff / previousSubtotal * 100) : 0;
    
    const costDiff = currentCost - previousCost;
    const costDiffPercent = previousCost > 0 ? (costDiff / previousCost * 100) : 0;
    
    const markupDiff = currentMarkup - previousMarkup;
    const markupDiffPercent = previousMarkup > 0 ? (markupDiff / previousMarkup * 100) : 0;
    
    const marginDiff = currentGrossMargin - previousGrossMargin;
    const marginDiffPercent = previousGrossMargin > 0 ? (marginDiff / previousGrossMargin * 100) : 0;
    
    const marginPercentageDiff = currentMarginPercentage - previousMarginPercentage;
    
    return {
      current: {
        subtotal: currentSubtotal,
        cost: currentCost,
        markup: currentMarkup,
        margin: currentGrossMargin,
        marginPercentage: currentMarginPercentage
      },
      previous: {
        subtotal: previousSubtotal,
        cost: previousCost,
        markup: previousMarkup,
        margin: previousGrossMargin,
        marginPercentage: previousMarginPercentage
      },
      diff: {
        subtotal: subtotalDiff,
        subtotalPercent: subtotalDiffPercent,
        cost: costDiff,
        costPercent: costDiffPercent,
        markup: markupDiff,
        markupPercent: markupDiffPercent,
        margin: marginDiff,
        marginPercent: marginDiffPercent,
        marginPercentageDiff: marginPercentageDiff
      }
    };
  }, [currentItems, previousItems]);
  
  const renderChangeIndicator = (value: number) => {
    if (Math.abs(value) < 0.01) return <Minus className="h-3.5 w-3.5 text-gray-500" />;
    return value > 0 
      ? <ArrowUp className="h-3.5 w-3.5 text-green-500" />
      : <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
  };
  
  const getChangeColor = (value: number, inverseForCost: boolean = false) => {
    if (Math.abs(value) < 0.01) return "text-gray-600";
    
    // For costs, an increase is usually bad (red) and a decrease is good (green)
    if (inverseForCost) {
      return value > 0 ? "text-red-600" : "text-green-600";
    }
    
    return value > 0 ? "text-green-600" : "text-red-600";
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 bg-slate-50">
        <CardTitle className="text-base font-medium">
          Financial Comparison
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-5">
          {/* Subtotal Comparison */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Subtotal</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-slate-50">
                  V{previousRevision.version}
                </Badge>
                <span className="font-medium">{formatCurrency(financial.previous.subtotal)}</span>
                <span className="text-sm mx-2">→</span>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800">
                  V{currentRevision.version}
                </Badge>
                <span className="font-medium">{formatCurrency(financial.current.subtotal)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {renderChangeIndicator(financial.diff.subtotal)}
                <span className={`ml-1 ${getChangeColor(financial.diff.subtotal)}`}>
                  {financial.diff.subtotal > 0 ? '+' : ''}
                  {formatCurrency(financial.diff.subtotal)}
                </span>
              </div>
              
              <span className={`text-xs ${getChangeColor(financial.diff.subtotalPercent)}`}>
                {financial.diff.subtotalPercent > 0 ? '+' : ''}
                {financial.diff.subtotalPercent.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Cost and Margin Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cost */}
            <div className="p-3 border rounded-md">
              <div className="text-sm font-medium mb-1">Cost</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Previous:</span>
                <span className="font-medium">{formatCurrency(financial.previous.cost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current:</span>
                <span className="font-medium">{formatCurrency(financial.current.cost)}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center">
                  {renderChangeIndicator(financial.diff.cost)}
                  <span className={`ml-1 ${getChangeColor(financial.diff.cost, true)}`}>
                    {financial.diff.cost > 0 ? '+' : ''}
                    {formatCurrency(financial.diff.cost)}
                  </span>
                </div>
                <span className={`text-xs ${getChangeColor(financial.diff.costPercent, true)}`}>
                  {financial.diff.costPercent > 0 ? '+' : ''}
                  {financial.diff.costPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Markup */}
            <div className="p-3 border rounded-md">
              <div className="text-sm font-medium mb-1">Markup</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Previous:</span>
                <span className="font-medium">{formatCurrency(financial.previous.markup)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current:</span>
                <span className="font-medium">{formatCurrency(financial.current.markup)}</span>
              </div>
              
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center">
                  {renderChangeIndicator(financial.diff.markup)}
                  <span className={`ml-1 ${getChangeColor(financial.diff.markup)}`}>
                    {financial.diff.markup > 0 ? '+' : ''}
                    {formatCurrency(financial.diff.markup)}
                  </span>
                </div>
                <span className={`text-xs ${getChangeColor(financial.diff.markupPercent)}`}>
                  {financial.diff.markupPercent > 0 ? '+' : ''}
                  {financial.diff.markupPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Gross Margin */}
            <div className="p-3 border rounded-md">
              <div className="text-sm font-medium mb-1">Gross Margin</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Previous:</span>
                <div className="flex items-center">
                  <span className="font-medium mr-1">{formatCurrency(financial.previous.margin)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {financial.previous.marginPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current:</span>
                <div className="flex items-center">
                  <span className="font-medium mr-1">{formatCurrency(financial.current.margin)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {financial.current.marginPercentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <div className="flex items-center">
                  {renderChangeIndicator(financial.diff.margin)}
                  <span className={`ml-1 ${getChangeColor(financial.diff.margin)}`}>
                    {financial.diff.margin > 0 ? '+' : ''}
                    {formatCurrency(financial.diff.margin)}
                  </span>
                </div>
                <span className={`text-xs ${getChangeColor(financial.diff.marginPercentageDiff)}`}>
                  {financial.diff.marginPercentageDiff > 0 ? '+' : ''}
                  {financial.diff.marginPercentageDiff.toFixed(1)} pts
                </span>
              </div>
            </div>
          </div>
          
          {/* Margin Percentage Visualization */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium">Margin % Comparison</div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-gray-300 rounded-full mr-1"></div>
                  <span>Previous</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-[#0485ea] rounded-full mr-1"></div>
                  <span>Current</span>
                </div>
              </div>
            </div>
            
            <div className="relative pt-6">
              <div className="absolute top-0 left-0 text-xs text-muted-foreground">0%</div>
              <div className="absolute top-0 right-0 text-xs text-muted-foreground">50%</div>
              
              <div className="mb-4">
                <div className="text-xs mb-1">Previous: {financial.previous.marginPercentage.toFixed(1)}%</div>
                <Progress value={Math.min(financial.previous.marginPercentage * 2, 100)} className="h-2 bg-gray-200" />
              </div>
              
              <div>
                <div className="text-xs mb-1">Current: {financial.current.marginPercentage.toFixed(1)}%</div>
                <Progress value={Math.min(financial.current.marginPercentage * 2, 100)} className="h-2 bg-[#0485ea]" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevisionFinancialComparison;
