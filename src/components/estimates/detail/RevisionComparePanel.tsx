import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import useRevisionComparison from '../hooks/useRevisionComparison';
import { formatCurrency } from '@/lib/utils';

interface RevisionComparePanelProps {
  estimateId: string;
}

const RevisionComparePanel: React.FC<RevisionComparePanelProps> = ({ estimateId }) => {
  const {
    isLoading,
    revisions,
    currentRevisionId,
    compareRevisionId,
    comparisonData,
    setCurrentRevisionId,
    setCompareRevisionId,
    compareRevisions,
  } = useRevisionComparison({
    estimateId,
    onError: error => console.error(error),
  });

  const handleCompare = () => {
    if (currentRevisionId && compareRevisionId) {
      compareRevisions(currentRevisionId, compareRevisionId);
    }
  };

  const handleSwapRevisions = () => {
    if (currentRevisionId && compareRevisionId) {
      const temp = currentRevisionId;
      setCurrentRevisionId(compareRevisionId);
      setCompareRevisionId(temp);
    }
  };

  if (revisions.length < 2) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-2">At least two revisions are needed to compare.</p>
        <p className="text-sm text-muted-foreground">Create a new revision to enable comparison.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <label className="block text-xs text-muted-foreground mb-1">Current Revision</label>
          <Select
            value={currentRevisionId || ''}
            onValueChange={setCurrentRevisionId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select current revision" />
            </SelectTrigger>
            <SelectContent>
              {revisions.map(revision => (
                <SelectItem key={revision.id} value={revision.id}>
                  Version {revision.version} (
                  {new Date(revision.revision_date).toLocaleDateString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex mt-6"
          onClick={handleSwapRevisions}
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>

        <div className="w-full sm:w-64">
          <label className="block text-xs text-muted-foreground mb-1">Compare With</label>
          <Select
            value={compareRevisionId || ''}
            onValueChange={setCompareRevisionId}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select revision to compare" />
            </SelectTrigger>
            <SelectContent>
              {revisions
                .filter(revision => revision.id !== currentRevisionId)
                .map(revision => (
                  <SelectItem key={revision.id} value={revision.id}>
                    Version {revision.version} (
                    {new Date(revision.revision_date).toLocaleDateString()})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="mt-0 sm:mt-6"
          onClick={handleCompare}
          disabled={
            !currentRevisionId || !compareRevisionId || currentRevisionId === compareRevisionId
          }
        >
          Compare
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      ) : comparisonData ? (
        <div className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Summary</h3>
                  <div className="text-xs text-muted-foreground mb-1">
                    Comparing Version {comparisonData.currentRevision.version} with Version{' '}
                    {comparisonData.compareRevision.version}
                  </div>
                  <div className="text-xl font-semibold text-[#0485ea]">
                    {formatCurrency(comparisonData.currentRevision.amount || 0)}
                  </div>
                  <div
                    className={`text-sm ${comparisonData.totalDifference > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {comparisonData.totalDifference > 0 ? '+' : ''}
                    {formatCurrency(comparisonData.totalDifference)} (
                    {comparisonData.percentageChange.toFixed(1)}%)
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Changes</h3>
                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Items Added:</div>
                      <div>{comparisonData.addedItems.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Items Removed:</div>
                      <div>{comparisonData.removedItems.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Items Modified:</div>
                      <div>{comparisonData.changedItems.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Total Changes:</div>
                      <div>{comparisonData.summary.totalItemsChanged}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Cost Impact</h3>
                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">New Items:</div>
                      <div className="text-green-600">
                        {formatCurrency(comparisonData.summary.newItemsCost)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Removed Items:</div>
                      <div className="text-red-600">
                        -{formatCurrency(comparisonData.summary.removedItemsCost)}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-muted-foreground">
                        Modified Items Difference:
                      </div>
                      <div
                        className={
                          comparisonData.summary.modifiedItemsDifference > 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {comparisonData.summary.modifiedItemsDifference > 0 ? '+' : ''}
                        {formatCurrency(comparisonData.summary.modifiedItemsDifference)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {comparisonData.changedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Modified Items</h3>
              <div className="space-y-2">
                {comparisonData.changedItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="font-medium">{item.current.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.changes.map(change => (
                              <span key={change.field} className="mr-2">
                                {change.field}: {change.previousValue} → {change.currentValue}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          className={`text-sm ${item.priceDifference > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {item.priceDifference > 0 ? '+' : ''}
                          {formatCurrency(item.priceDifference)} (
                          {item.percentageDifference.toFixed(1)}%)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {comparisonData.addedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Added Items</h3>
              <div className="space-y-2">
                {comparisonData.addedItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </div>
                        </div>
                        <div className="text-sm text-green-600">
                          +{formatCurrency(item.total_price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {comparisonData.removedItems.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Removed Items</h3>
              <div className="space-y-2">
                {comparisonData.removedItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </div>
                        </div>
                        <div className="text-sm text-red-600">
                          -{formatCurrency(item.total_price)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : currentRevisionId && compareRevisionId && currentRevisionId !== compareRevisionId ? (
        <div className="text-center py-6">
          <Button onClick={handleCompare}>Compare Selected Revisions</Button>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            Select two different revisions to compare their changes.
          </p>
        </div>
      )}
    </div>
  );
};

export default RevisionComparePanel;
