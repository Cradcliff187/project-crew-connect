import React from 'react';
// Import all needed types from the canonical types file
import {
  EstimateItem,
  EstimateRevision,
  RevisionComparisonResult,
  ItemChange,
  ChangedItemDetail,
} from '../types/estimateTypes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, PlusCircle, MinusCircle, Edit2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface RevisionComparisonViewProps {
  comparisonResult: RevisionComparisonResult;
}

const RevisionComparisonView: React.FC<RevisionComparisonViewProps> = ({ comparisonResult }) => {
  const { revisionA, revisionB, addedItems, removedItems, changedItems, summary } =
    comparisonResult;

  const renderChangeValue = (value: any, changeType: 'added' | 'removed' | 'same' | 'modified') => {
    // Simple rendering for now, can be enhanced
    if (changeType === 'added') return <span className="text-green-600">{value}</span>;
    if (changeType === 'removed') return <span className="text-red-600 line-through">{value}</span>;
    if (changeType === 'modified') return <span className="text-orange-600">{value}</span>; // Representing the new value
    return <span>{value}</span>;
  };

  const renderPriceChange = (diff: number) => {
    if (diff > 0) {
      return (
        <span className="text-xs text-green-600 flex items-center">
          <ArrowUp className="h-3 w-3 mr-1" />
          {formatCurrency(diff)}
        </span>
      );
    } else if (diff < 0) {
      return (
        <span className="text-xs text-red-600 flex items-center">
          <ArrowDown className="h-3 w-3 mr-1" />
          {formatCurrency(Math.abs(diff))}
        </span>
      );
    }
    return null;
  };

  const renderFieldChange = (change: ItemChange) => {
    const formatValue = (val: any) => {
      if (
        typeof val === 'number' &&
        (change.field.includes('price') ||
          change.field.includes('amount') ||
          change.field.includes('cost'))
      ) {
        return formatCurrency(val);
      }
      if (val === null || val === undefined || val === '')
        return <span className="text-gray-400 italic">empty</span>;
      return String(val);
    };

    return (
      <li key={String(change.field)} className="text-xs">
        <span className="font-medium capitalize">{String(change.field).replace(/_/g, ' ')}:</span>{' '}
        {formatValue(change.previousValue)} → {formatValue(change.currentValue)}
      </li>
    );
  };

  return (
    <ScrollArea className="h-full p-1">
      <div className="space-y-6 pr-4">
        {/* Summary Section */}
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Net Amount Change</span>
              <span
                className={`font-medium ${summary.netAmountChange > 0 ? 'text-green-600' : summary.netAmountChange < 0 ? 'text-red-600' : ''}`}
              >
                {summary.netAmountChange >= 0 ? '+' : '-'}
                {formatCurrency(Math.abs(summary.netAmountChange))}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Items Added</span>
              <span className="font-medium text-green-600">{summary.totalItemsAdded}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Items Removed</span>
              <span className="font-medium text-red-600">{summary.totalItemsRemoved}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Items Changed</span>
              <span className="font-medium text-orange-600">{summary.totalItemsChanged}</span>
            </div>
          </CardContent>
        </Card>

        {/* Changed Items Section */}
        {changedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Edit2 className="h-4 w-4 mr-2 text-orange-500" />
                Changed Items ({changedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedItems.map(detail => (
                    <TableRow key={detail.current.id} className="align-top hover:bg-orange-50/50">
                      <TableCell>
                        {detail.current.description}
                        <ul className="mt-1 list-disc list-inside pl-2 text-muted-foreground">
                          {detail.changes.map(renderFieldChange)}
                        </ul>
                      </TableCell>
                      <TableCell className="text-right">
                        {detail.current.quantity}
                        {detail.changes.some(c => c.field === 'quantity') && (
                          <div className="text-xs text-gray-500 line-through">
                            {detail.previous.quantity}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detail.current.unit_price)}
                        {detail.changes.some(c => c.field === 'unit_price') && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(detail.previous.unit_price)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(detail.current.total_price)}
                        {renderPriceChange(detail.priceDifference)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Added Items Section */}
        {addedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <PlusCircle className="h-4 w-4 mr-2 text-green-500" />
                Added Items ({addedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addedItems.map(item => (
                    <TableRow key={item.id} className="bg-green-50/50 hover:bg-green-50/70">
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Removed Items Section */}
        {removedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <MinusCircle className="h-4 w-4 mr-2 text-red-500" />
                Removed Items ({removedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {removedItems.map(item => (
                    <TableRow key={item.id} className="bg-red-50/50 hover:bg-red-50/70">
                      <TableCell className="line-through">{item.description}</TableCell>
                      <TableCell className="text-right line-through">{item.quantity}</TableCell>
                      <TableCell className="text-right line-through">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right line-through">
                        {formatCurrency(item.total_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Display message if no changes detected */}
        {addedItems.length === 0 && removedItems.length === 0 && changedItems.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No line item changes detected between these revisions.
          </p>
        )}

        <DialogHeader>
          <DialogTitle>Revision Comparison</DialogTitle>
          {comparisonResult && (
            <DialogDescription>
              Comparing Version {comparisonResult.revisionA.version} (
              {formatDate(comparisonResult.revisionA.revision_date)}) with Version{' '}
              {comparisonResult.revisionB.version} (
              {formatDate(comparisonResult.revisionB.revision_date)})
            </DialogDescription>
          )}
        </DialogHeader>
      </div>
    </ScrollArea>
  );
};

export default RevisionComparisonView;
