import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, DollarSign, CalendarDays, CheckCircle2, XCircle, PlusCircle, MinusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EstimateRevision } from '../types/estimateTypes';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RevisionComparisonProps {
  estimateId: string;
  currentRevisionId: string;
  revisions: EstimateRevision[];
  onRevisionSelect: (id: string) => void;
}

const RevisionComparison: React.FC<RevisionComparisonProps> = ({ 
  estimateId, 
  currentRevisionId,
  revisions,
  onRevisionSelect
}) => {
  const [loading, setLoading] = useState(false);
  const [compareRevisionId, setCompareRevisionId] = useState<string | null>(null);
  const [currentRevisionItems, setCurrentRevisionItems] = useState<any[]>([]);
  const [compareRevisionItems, setCompareRevisionItems] = useState<any[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'items' | 'summary'>('items'); // Default to items
  const { toast } = useToast();

  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  const compareRevision = revisions.find(rev => rev.id === compareRevisionId);

  const availableRevisions = revisions
    .filter(rev => rev.id !== currentRevisionId)
    .sort((a, b) => b.version - a.version);

  useEffect(() => {
    if (availableRevisions.length > 0 && !compareRevisionId) {
      setCompareRevisionId(availableRevisions[0].id);
    }
  }, [availableRevisions, compareRevisionId]);

  useEffect(() => {
    if (currentRevisionId && compareRevisionId) {
      fetchRevisionItems();
    }
  }, [currentRevisionId, compareRevisionId]);

  const fetchRevisionItems = async () => {
    setLoading(true);
    try {
      const { data: currentItems, error: currentError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevisionId)
        .order('created_at', { ascending: true });
        
      if (currentError) throw currentError;
      setCurrentRevisionItems(currentItems || []);
      
      const { data: compareItems, error: compareError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', compareRevisionId)
        .order('created_at', { ascending: true });
        
      if (compareError) throw compareError;
      setCompareRevisionItems(compareItems || []);
      
    } catch (error) {
      console.error('Error fetching revision items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revision data for comparison',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToRevision = (id: string) => {
    onRevisionSelect(id);
  };

  const calculateDifference = () => {
    if (!currentRevision || !compareRevision) return { amount: 0, percentage: 0 };
    
    const currentAmount = currentRevision.amount || 0;
    const compareAmount = compareRevision.amount || 0;
    const difference = currentAmount - compareAmount;
    const percentage = compareAmount !== 0 
      ? Math.round((difference / compareAmount) * 1000) / 10
      : 0;
      
    return {
      amount: difference,
      percentage: percentage
    };
  };

  const difference = calculateDifference();
  const isNewer = currentRevision && compareRevision 
    ? currentRevision.version > compareRevision.version 
    : false;

  const getItemChanges = () => {
    const current = currentRevisionItems.map(item => ({ id: item.description, total: item.total_price }));
    const compare = compareRevisionItems.map(item => ({ id: item.description, total: item.total_price }));
    
    const added = current.filter(item => !compare.some(c => c.id === item.id)).length;
    const removed = compare.filter(item => !current.some(c => c.id === item.id)).length;
    const changed = current.filter(item => {
      const compareItem = compare.find(c => c.id === item.id);
      return compareItem && compareItem.total !== item.total;
    }).length;
    
    return { added, removed, changed };
  };
  
  const changes = getItemChanges();

  if (!currentRevision) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Select a revision to compare</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Compare Revisions</CardTitle>
          <Select value={compareRevisionId || ''} onValueChange={setCompareRevisionId}>
            <SelectTrigger className="w-[200px] h-8">
              <SelectValue placeholder="Select revision to compare" />
            </SelectTrigger>
            <SelectContent>
              {availableRevisions.map(rev => (
                <SelectItem key={rev.id} value={rev.id}>
                  Version {rev.version} ({formatDate(rev.revision_date)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : compareRevision ? (
          <>
            <div className="mb-3">
              <Tabs
                value={comparisonMode}
                onValueChange={(value) => setComparisonMode(value as 'items' | 'summary')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="items">Line Items</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <TabsContent value="summary" className="m-0 mt-2">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-slate-50 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Current Version</div>
                  <div className="text-lg font-semibold">{formatCurrency(currentRevision.amount || 0)}</div>
                  <div className="text-xs mt-1">Version {currentRevision.version}</div>
                </div>
                
                <div className="p-3 bg-slate-50 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Compared Version</div>
                  <div className="text-lg font-semibold">{formatCurrency(compareRevision.amount || 0)}</div>
                  <div className="text-xs mt-1">Version {compareRevision.version}</div>
                </div>
              </div>
              
              <div className="p-3 mb-3 border rounded-md bg-blue-50/30 border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowLeftRight className="h-4 w-4 mr-2 text-[#0485ea]" />
                    <span className="font-medium text-sm">Difference</span>
                  </div>
                  <span className={`text-sm font-medium ${difference.amount > 0 ? 'text-green-600' : difference.amount < 0 ? 'text-red-600' : ''}`}>
                    {difference.amount > 0 ? '+' : ''}{formatCurrency(difference.amount)}
                    <span className="ml-1 text-xs">
                      ({difference.percentage > 0 ? '+' : ''}{difference.percentage}%)
                    </span>
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div>
                    <div className="text-xs text-green-600 font-medium">{changes.added}</div>
                    <div className="text-xs text-muted-foreground">Items Added</div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-medium">{changes.changed}</div>
                    <div className="text-xs text-muted-foreground">Items Changed</div>
                  </div>
                  <div>
                    <div className="text-xs text-red-600 font-medium">{changes.removed}</div>
                    <div className="text-xs text-muted-foreground">Items Removed</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-md">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                    Date Changed
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>{formatDate(currentRevision.revision_date)}</div>
                    <div>{formatDate(compareRevision.revision_date)}</div>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md">
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                    Status
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>{currentRevision.status || 'draft'}</div>
                    <div>{compareRevision.status || 'draft'}</div>
                  </div>
                </div>
              </div>
              
              {isNewer && compareRevision && (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSwitchToRevision(compareRevision.id)}
                  >
                    Switch to Version {compareRevision.version}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="items" className="m-0 mt-2">
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-2 text-xs font-medium bg-slate-50 p-2">
                  <div>Current (v{currentRevision.version})</div>
                  <div>Compared (v{compareRevision.version})</div>
                </div>
                
                <Separator />
                
                <div className="max-h-[400px] overflow-y-auto">
                  {currentRevisionItems.length === 0 && compareRevisionItems.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No line items available for comparison
                    </div>
                  ) : (
                    <div>
                      {currentRevisionItems.map((item, index) => {
                        const matchingItem = compareRevisionItems.find(ci => 
                          ci.description === item.description || 
                          (item.original_item_id && ci.id === item.original_item_id));
                        
                        const isChanged = matchingItem && matchingItem.total_price !== item.total_price;
                        const isNew = !matchingItem;
                        
                        return (
                          <div key={item.id} className={`grid grid-cols-2 p-3 text-sm ${index % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                            <div className="pr-3">
                              <div className="flex justify-between mb-1.5">
                                <div className="font-medium flex items-center">
                                  {isNew && <PlusCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />}
                                  {item.description}
                                </div>
                                <div>
                                  {isNew && <Badge variant="outline" className="bg-green-100 text-green-800 text-[10px]">NEW</Badge>}
                                  {isChanged && <Badge variant="outline" className="bg-blue-100 text-blue-800 text-[10px]">CHANGED</Badge>}
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-muted-foreground">
                                  {item.quantity} × ${item.unit_price?.toFixed(2)}
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={`font-medium ${isChanged ? 'text-blue-700' : ''}`}>
                                        ${item.total_price?.toFixed(2)}
                                      </div>
                                    </TooltipTrigger>
                                    {isChanged && matchingItem && (
                                      <TooltipContent side="top">
                                        <div className="text-xs">
                                          <div className={item.total_price > matchingItem.total_price ? 'text-green-600' : 'text-red-600'}>
                                            {item.total_price > matchingItem.total_price ? '+' : ''}
                                            ${(item.total_price - matchingItem.total_price).toFixed(2)}
                                          </div>
                                          <div className="text-muted-foreground">
                                            {((item.total_price - matchingItem.total_price) / matchingItem.total_price * 100).toFixed(1)}%
                                          </div>
                                        </div>
                                      </TooltipContent>
                                    )}
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                            
                            <div className="pl-3 border-l">
                              {matchingItem ? (
                                <>
                                  <div className="flex justify-between mb-1.5">
                                    <div className="font-medium">{matchingItem.description}</div>
                                  </div>
                                  <div className="flex justify-between">
                                    <div className="text-muted-foreground">
                                      {matchingItem.quantity} × ${matchingItem.unit_price?.toFixed(2)}
                                    </div>
                                    <div className="font-medium">${matchingItem.total_price?.toFixed(2)}</div>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center h-full text-muted-foreground italic">
                                  Not present in this revision
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {compareRevisionItems
                        .filter(item => !currentRevisionItems.some(ci => 
                          ci.description === item.description || 
                          ci.original_item_id === item.id))
                        .map((item, index) => (
                          <div key={item.id} className={`grid grid-cols-2 p-3 text-sm ${(currentRevisionItems.length + index) % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                            <div className="pr-3">
                              <div className="flex items-center h-full text-muted-foreground italic">
                                Not present in this revision
                              </div>
                            </div>
                            
                            <div className="pl-3 border-l">
                              <div className="flex justify-between mb-1.5">
                                <div className="font-medium flex items-center">
                                  <MinusCircle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                                  {item.description}
                                </div>
                                <Badge variant="outline" className="bg-red-100 text-red-800 text-[10px]">REMOVED</Badge>
                              </div>
                              <div className="flex justify-between">
                                <div className="text-muted-foreground">
                                  {item.quantity} × ${item.unit_price?.toFixed(2)}
                                </div>
                                <div className="font-medium">${item.total_price?.toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-50 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Current Total</div>
                    <div className="text-base font-semibold">{formatCurrency(currentRevisionItems.reduce((sum, item) => sum + (item.total_price || 0), 0))}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Compared Total</div>
                    <div className="text-base font-semibold">{formatCurrency(compareRevisionItems.reduce((sum, item) => sum + (item.total_price || 0), 0))}</div>
                  </div>
                </div>
              </div>
              
              {isNewer && compareRevision && (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSwitchToRevision(compareRevision.id)}
                  >
                    Switch to Version {compareRevision.version}
                  </Button>
                </div>
              )}
            </TabsContent>
          </>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-2">No other revisions available for comparison</p>
            <p className="text-xs text-muted-foreground">Create a new revision to enable comparison</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevisionComparison;
