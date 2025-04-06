
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Loader2, ArrowLeftRight, Plus, Minus, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EstimateRevision } from '../types/estimateTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [loading, setLoading] = useState(false);
  const [compareRevisionId, setCompareRevisionId] = useState<string | null>(null);
  const [currentRevisionItems, setCurrentRevisionItems] = useState<any[]>([]);
  const [compareRevisionItems, setCompareRevisionItems] = useState<any[]>([]);
  const [summaryVisible, setSummaryVisible] = useState(true);
  
  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  const compareRevision = revisions.find(rev => rev.id === compareRevisionId);
  
  // Filter out the current revision from available comparison options
  const availableRevisions = revisions
    .filter(rev => rev.id !== currentRevisionId)
    .sort((a, b) => b.version - a.version);
  
  // Select the most recent revision for comparison by default
  useEffect(() => {
    if (availableRevisions.length > 0 && !compareRevisionId) {
      setCompareRevisionId(availableRevisions[0].id);
    }
  }, [availableRevisions, compareRevisionId]);

  // Fetch items when revisions change
  useEffect(() => {
    if (currentRevisionId && compareRevisionId) {
      fetchRevisionItems();
    }
  }, [currentRevisionId, compareRevisionId]);

  const fetchRevisionItems = async () => {
    setLoading(true);
    try {
      // Fetch items for current revision
      const { data: currentItems, error: currentError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevisionId)
        .order('created_at', { ascending: true });
      
      if (currentError) throw currentError;
      setCurrentRevisionItems(currentItems || []);
      
      // Fetch items for comparison revision
      const { data: compareItems, error: compareError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', compareRevisionId)
        .order('created_at', { ascending: true });
      
      if (compareError) throw compareError;
      setCompareRevisionItems(compareItems || []);
      
    } catch (error) {
      console.error('Error fetching revision items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial differences between the revisions
  const calculateDifference = () => {
    if (!currentRevision || !compareRevision) return { amount: 0, percentage: 0 };
    
    const currentAmount = currentRevision.amount || 0;
    const compareAmount = compareRevision.amount || 0;
    const difference = currentAmount - compareAmount;
    const percentage = compareAmount !== 0 
      ? ((difference / compareAmount) * 100)
      : 0;
      
    return {
      amount: difference,
      percentage: Math.round(percentage * 10) / 10,
      isIncrease: difference > 0
    };
  };
  
  const difference = calculateDifference();
  
  // Analyze item changes
  const getItemChanges = () => {
    if (!currentRevisionItems.length && !compareRevisionItems.length) {
      return { added: 0, removed: 0, changed: 0, unchanged: 0 };
    }
    
    const added = currentRevisionItems.filter(item => 
      !compareRevisionItems.some(ci => 
        ci.description === item.description || 
        (item.original_item_id && ci.id === item.original_item_id)
      )).length;
      
    const removed = compareRevisionItems.filter(item => 
      !currentRevisionItems.some(ci => 
        ci.description === item.description || 
        (item.original_item_id && ci.id === item.original_item_id)
      )).length;
      
    const changed = currentRevisionItems.filter(item => {
      const matchingItem = compareRevisionItems.find(ci => 
        ci.description === item.description ||
        (item.original_item_id && ci.id === item.original_item_id)
      );
      return matchingItem && matchingItem.total_price !== item.total_price;
    }).length;
    
    const unchanged = currentRevisionItems.filter(item => {
      const matchingItem = compareRevisionItems.find(ci => 
        ci.description === item.description ||
        (item.original_item_id && ci.id === item.original_item_id)
      );
      return matchingItem && matchingItem.total_price === item.total_price;
    }).length;
    
    return { added, removed, changed, unchanged };
  };
  
  const changes = getItemChanges();
  
  // Determine which items to display in the comparison table
  const getComparisonItems = () => {
    const allItems = new Map();
    
    // First add all items from current revision
    currentRevisionItems.forEach(item => {
      const key = item.description;
      allItems.set(key, {
        description: item.description,
        current: {
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        },
        compare: null,
        status: 'added'
      });
    });
    
    // Then process compare revision items
    compareRevisionItems.forEach(item => {
      const key = item.description;
      if (allItems.has(key)) {
        // Item exists in both revisions
        const existing = allItems.get(key);
        existing.compare = {
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        };
        
        const hasChanged = 
          existing.current.quantity !== item.quantity ||
          existing.current.unit_price !== item.unit_price ||
          existing.current.total_price !== item.total_price;
          
        existing.status = hasChanged ? 'changed' : 'unchanged';
      } else {
        // Item only in compare revision
        allItems.set(key, {
          description: item.description,
          current: null,
          compare: {
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          },
          status: 'removed'
        });
      }
    });
    
    // Convert to array and sort
    const sortOrder = { added: 1, changed: 2, unchanged: 3, removed: 4 };
    return Array.from(allItems.values()).sort((a, b) => {
      return sortOrder[a.status] - sortOrder[b.status];
    });
  };
  
  const comparisonItems = getComparisonItems();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'removed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'changed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <Plus className="h-3 w-3" />;
      case 'removed':
        return <Minus className="h-3 w-3" />;
      case 'changed':
        return <ArrowLeftRight className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getPriceChangeDisplay = (current: number | undefined, compare: number | undefined) => {
    if (current === undefined || compare === undefined) return null;
    
    const diff = current - compare;
    if (diff === 0) return null;
    
    const percentage = compare !== 0 ? ((diff / compare) * 100) : 0;
    const roundedPercentage = Math.round(percentage * 10) / 10;
    
    const isPositive = diff > 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`text-xs mt-1 ${color}`}>
        {isPositive ? '+' : ''}{formatCurrency(diff)} ({roundedPercentage > 0 ? '+' : ''}{roundedPercentage}%)
      </div>
    );
  };

  if (!currentRevision) {
    return (
      <Card className="border-[#0485ea]/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-20">
            <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-muted-foreground">No revision selected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0485ea]/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Revision Comparison</CardTitle>
          <Select value={compareRevisionId || ''} onValueChange={setCompareRevisionId}>
            <SelectTrigger className="w-[200px] h-8 text-sm">
              <SelectValue placeholder="Select a revision to compare" />
            </SelectTrigger>
            <SelectContent>
              {availableRevisions.map(rev => (
                <SelectItem key={rev.id} value={rev.id}>
                  Version {rev.version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-[#0485ea] mr-2" />
            <span className="text-sm">Loading comparison data...</span>
          </div>
        ) : (
          <>
            {/* Financial summary */}
            {summaryVisible && (
              <div className="mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#0485ea]/5 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Current Version ({currentRevision.version})</div>
                    <div className="text-lg font-semibold">{formatCurrency(currentRevision.amount || 0)}</div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Compare Version ({compareRevision?.version || '—'})</div>
                    <div className="text-lg font-semibold">{compareRevision ? formatCurrency(compareRevision.amount || 0) : '—'}</div>
                  </div>
                </div>
                
                {compareRevision && (
                  <div className="p-3 border rounded-md bg-slate-50/50 border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <ArrowLeftRight className="h-4 w-4 mr-1.5 text-[#0485ea]" />
                        <span className="text-sm font-medium">Difference</span>
                      </div>
                      <div className={`text-sm font-medium ${difference.amount > 0 ? 'text-green-600' : difference.amount < 0 ? 'text-red-600' : ''}`}>
                        {difference.amount >= 0 ? '+' : ''}{formatCurrency(difference.amount)}
                        <span className="ml-1 text-xs">
                          ({difference.percentage > 0 ? '+' : ''}{difference.percentage}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center">
                        <div className="text-xs font-medium text-green-600">{changes.added}</div>
                        <div className="text-xs text-muted-foreground">Items Added</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-amber-600">{changes.changed}</div>
                        <div className="text-xs text-muted-foreground">Items Changed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-red-600">{changes.removed}</div>
                        <div className="text-xs text-muted-foreground">Items Removed</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Comparison table */}
            {compareRevision ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs">
                    <tr>
                      <th className="py-2 px-3 text-left">Item</th>
                      <th className="py-2 px-3 text-right">
                        <div>Current (v{currentRevision.version})</div>
                      </th>
                      <th className="py-2 px-3 text-right">
                        <div>Compare (v{compareRevision.version})</div>
                      </th>
                      <th className="py-2 px-2 text-center w-16">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {comparisonItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-sm text-muted-foreground">
                          No items available for comparison
                        </td>
                      </tr>
                    ) : (
                      comparisonItems.map((item, index) => (
                        <tr 
                          key={`${item.description}-${index}`}
                          className={`${item.status === 'added' ? 'bg-green-50/30' : 
                                      item.status === 'removed' ? 'bg-red-50/30' : 
                                      item.status === 'changed' ? 'bg-amber-50/30' : ''}`}
                        >
                          <td className="py-2 px-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate max-w-[150px] md:max-w-[250px]">
                                    {item.description}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>{item.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="py-2 px-3 text-right">
                            {item.current ? (
                              <div>
                                <div className="font-medium">{formatCurrency(item.current.total_price)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.current.quantity} × {formatCurrency(item.current.unit_price)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {item.compare ? (
                              <div>
                                <div className="font-medium">{formatCurrency(item.compare.total_price)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.compare.quantity} × {formatCurrency(item.compare.unit_price)}
                                </div>
                                {item.status === 'changed' && getPriceChangeDisplay(item.current?.total_price, item.compare.total_price)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Badge variant="outline" className={`${getStatusColor(item.status)} text-[10px] px-2 py-0.5 flex items-center justify-center gap-1`}>
                              {getStatusIcon(item.status)}
                              <span className="uppercase">{item.status}</span>
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  
                  <tfoot className="bg-slate-50 font-medium border-t">
                    <tr>
                      <td className="py-2 px-3 text-sm">Total</td>
                      <td className="py-2 px-3 text-right text-sm">{formatCurrency(currentRevision.amount || 0)}</td>
                      <td className="py-2 px-3 text-right text-sm">
                        {compareRevision ? formatCurrency(compareRevision.amount || 0) : '—'}
                      </td>
                      <td className="py-2 px-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 border rounded-md bg-slate-50">
                <span className="text-sm text-muted-foreground">Select a revision to compare</span>
              </div>
            )}
            
            {/* Actions */}
            {compareRevision && (
              <div className="flex justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onRevisionSelect(compareRevision.id)}
                  className="text-xs"
                >
                  Switch to Version {compareRevision.version}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RevisionComparePanel;
