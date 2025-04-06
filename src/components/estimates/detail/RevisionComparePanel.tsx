
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, PlusCircle, MinusCircle, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EstimateRevision } from '../types/estimateTypes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import useRevisionComparison from '../hooks/useRevisionComparison';

interface RevisionComparePanelProps {
  estimateId: string;
  currentRevisionId: string;
  revisions: EstimateRevision[];
  onRevisionSelect: (id: string) => void;
}

const RevisionComparePanel: React.FC<RevisionComparePanelProps> = ({ 
  estimateId, 
  currentRevisionId,
  revisions,
  onRevisionSelect
}) => {
  const [compareRevisionId, setCompareRevisionId] = useState<string | undefined>();
  
  const { 
    isLoading, 
    comparisonData, 
    setCurrentRevisionId, 
    setCompareRevisionId: setCompareId
  } = useRevisionComparison({ estimateId });

  // When component mounts or revisions change, set default compare revision
  useEffect(() => {
    if (revisions.length > 1 && currentRevisionId) {
      const currentVersionIndex = revisions.findIndex(rev => rev.id === currentRevisionId);
      if (currentVersionIndex !== -1 && currentVersionIndex + 1 < revisions.length) {
        const compareRev = revisions[currentVersionIndex + 1];
        setCompareRevisionId(compareRev.id);
        setCompareId(compareRev.id);
      } else if (currentVersionIndex > 0) {
        const compareRev = revisions[0];
        setCompareRevisionId(compareRev.id);
        setCompareId(compareRev.id);
      }
    }
  }, [revisions, currentRevisionId]);

  useEffect(() => {
    if (currentRevisionId) {
      setCurrentRevisionId(currentRevisionId);
    }
  }, [currentRevisionId]);

  const handleCompareRevisionChange = (value: string) => {
    setCompareRevisionId(value);
    setCompareId(value);
  };

  // Get available revisions for comparison (all except current)
  const availableRevisions = revisions.filter(rev => rev.id !== currentRevisionId);
  
  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  const compareRevision = revisions.find(rev => rev.id === compareRevisionId);

  if (revisions.length <= 1) {
    return null; // Don't show comparison if only one revision exists
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <ArrowLeftRight className="h-4 w-4 mr-2 text-[#0485ea]" />
            Revision Comparison
          </CardTitle>

          {availableRevisions.length > 0 && (
            <Select
              value={compareRevisionId}
              onValueChange={handleCompareRevisionChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select version to compare" />
              </SelectTrigger>
              <SelectContent>
                {availableRevisions.map(rev => (
                  <SelectItem key={rev.id} value={rev.id}>
                    {`Version ${rev.version} (${formatDate(rev.revision_date)})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !comparisonData ? (
          <div className="text-center p-4 text-muted-foreground">
            {compareRevisionId 
              ? "Select versions to compare" 
              : "No revisions available for comparison"}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">
                  Comparing Version {comparisonData.currentRevision.version} with Version {comparisonData.compareRevision.version}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(comparisonData.currentRevision.revision_date)} vs. {formatDate(comparisonData.compareRevision.revision_date)}
                </div>
              </div>
              
              <Badge className={`${comparisonData.totalDifference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {comparisonData.totalDifference >= 0 ? '+' : ''}{formatCurrency(comparisonData.totalDifference)} 
                ({comparisonData.percentageChange >= 0 ? '+' : ''}{comparisonData.percentageChange.toFixed(1)}%)
              </Badge>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Summary</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded-md p-2 bg-slate-50">
                  <div className="flex items-center">
                    <PlusCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-muted-foreground">New Items</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm font-medium">{comparisonData.addedItems.length} items</div>
                    <div className="text-sm text-green-600">{formatCurrency(comparisonData.summary.newItemsCost)}</div>
                  </div>
                </div>
                
                <div className="border rounded-md p-2 bg-slate-50">
                  <div className="flex items-center">
                    <MinusCircle className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-xs text-muted-foreground">Removed Items</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm font-medium">{comparisonData.removedItems.length} items</div>
                    <div className="text-sm text-red-600">{formatCurrency(comparisonData.summary.removedItemsCost)}</div>
                  </div>
                </div>
                
                <div className="border rounded-md p-2 bg-slate-50">
                  <div className="flex items-center">
                    <Edit className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-muted-foreground">Modified Items</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <div className="text-sm font-medium">{comparisonData.changedItems.length} items</div>
                    <div className={`text-sm ${comparisonData.summary.modifiedItemsDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {comparisonData.summary.modifiedItemsDifference >= 0 ? '+' : ''}
                      {formatCurrency(comparisonData.summary.modifiedItemsDifference)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {(comparisonData.addedItems.length > 0 || comparisonData.removedItems.length > 0 || comparisonData.changedItems.length > 0) && (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Added Items */}
                    {comparisonData.addedItems.slice(0, 3).map(item => (
                      <TableRow key={`added-${item.id}`}>
                        <TableCell>
                          <PlusCircle className="h-4 w-4 text-green-500" />
                        </TableCell>
                        <TableCell className="font-medium">{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right text-green-600">
                          +{formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Removed Items */}
                    {comparisonData.removedItems.slice(0, 3).map(item => (
                      <TableRow key={`removed-${item.id}`}>
                        <TableCell>
                          <MinusCircle className="h-4 w-4 text-red-500" />
                        </TableCell>
                        <TableCell className="font-medium line-through text-muted-foreground">{item.description}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Changed Items */}
                    {comparisonData.changedItems.slice(0, 3).map(item => (
                      <TableRow key={`changed-${item.current.id}`}>
                        <TableCell>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </TableCell>
                        <TableCell className="font-medium">{item.current.description}</TableCell>
                        <TableCell className="text-right">
                          {item.current.quantity}
                          {item.current.quantity !== item.previous.quantity && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (was {item.previous.quantity})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.current.unit_price)}
                          {item.current.unit_price !== item.previous.unit_price && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (was {formatCurrency(item.previous.unit_price)})
                            </span>
                          )}
                        </TableCell>
                        <TableCell className={`text-right ${item.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.priceDifference >= 0 ? '+' : ''}
                          {formatCurrency(item.priceDifference)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Show more indicator if needed */}
                    {(comparisonData.addedItems.length + comparisonData.removedItems.length + comparisonData.changedItems.length) > 9 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-2">
                          <span className="text-xs text-muted-foreground">
                            +{(comparisonData.addedItems.length + comparisonData.removedItems.length + comparisonData.changedItems.length) - 9} more changes
                          </span>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {/* Totals row */}
                    <TableRow>
                      <TableCell colSpan={3}></TableCell>
                      <TableCell className="font-medium text-right">Total Change</TableCell>
                      <TableCell className={`font-medium text-right ${comparisonData.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparisonData.totalDifference >= 0 ? '+' : ''}
                        {formatCurrency(comparisonData.totalDifference)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevisionComparePanel;
