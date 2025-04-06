
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EstimateRevision } from '../types/estimateTypes';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, ChevronRight, ChevronsRight, LineChart, BarChart, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevisionDetailedComparison from './RevisionDetailedComparison';
import RevisionFinancialComparison from './RevisionFinancialComparison';

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
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('summary');
  const { toast } = useToast();

  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  const compareRevision = revisions.find(rev => rev.id === compareRevisionId);

  // Filter available revisions for comparison (exclude current revision)
  const availableRevisions = revisions
    .filter(rev => rev.id !== currentRevisionId)
    .sort((a, b) => b.version - a.version);

  // Set default compare revision to the most recent one that isn't current
  useEffect(() => {
    if (availableRevisions.length > 0 && !compareRevisionId) {
      setCompareRevisionId(availableRevisions[0].id);
    }
  }, [availableRevisions, compareRevisionId]);

  // Fetch items when revisions are selected
  useEffect(() => {
    if (currentRevisionId && compareRevisionId) {
      fetchItems();
    }
  }, [currentRevisionId, compareRevisionId]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Fetch current revision items
      const { data: currentData, error: currentError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevisionId);

      if (currentError) throw currentError;
      setCurrentItems(currentData || []);

      // Fetch compare revision items
      const { data: compareData, error: compareError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', compareRevisionId);

      if (compareError) throw compareError;
      setCompareItems(compareData || []);

    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revision items for comparison',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate differences
  const calculateDifferences = () => {
    if (!currentRevision || !compareRevision) return null;

    const currentTotal = currentRevision.amount || 0;
    const compareTotal = compareRevision.amount || 0;
    const difference = currentTotal - compareTotal;
    const percentChange = compareTotal !== 0 
      ? (difference / compareTotal) * 100 
      : 0;

    // Count items added/removed/changed
    const addedItems = currentItems.filter(item => 
      !compareItems.some(ci => ci.description === item.description)).length;
    
    const removedItems = compareItems.filter(item => 
      !currentItems.some(ci => ci.description === item.description)).length;
    
    return {
      difference,
      percentChange,
      addedItems,
      removedItems,
      isIncrease: difference > 0
    };
  };

  const differences = calculateDifferences();

  // If no revisions to compare with, show a simpler panel
  if (availableRevisions.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-muted-foreground">No other revisions available for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center">
            <ArrowLeftRight className="h-4 w-4 mr-2 text-[#0485ea]" />
            Compare Revisions
          </CardTitle>
          
          <Select value={compareRevisionId} onValueChange={setCompareRevisionId}>
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
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Loading comparison data...</p>
          </div>
        ) : compareRevision && differences ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Current (v{currentRevision?.version})</div>
                <div className="text-lg font-semibold">{formatCurrency(currentRevision?.amount || 0)}</div>
                <div className="text-xs mt-1">Created {formatDate(currentRevision?.revision_date || '')}</div>
              </div>
              
              <div className="p-3 rounded-md border border-dashed flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-lg font-medium ${differences.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                    {differences.isIncrease ? '+' : ''}{formatCurrency(differences.difference)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {differences.percentChange > 0 ? '+' : ''}{differences.percentChange.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-md">
                <div className="text-xs text-muted-foreground mb-1">Version {compareRevision.version}</div>
                <div className="text-lg font-semibold">{formatCurrency(compareRevision.amount || 0)}</div>
                <div className="text-xs mt-1">Created {formatDate(compareRevision.revision_date || '')}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-4 grid grid-cols-3">
                  <TabsTrigger value="summary" className="flex items-center">
                    <List className="w-4 h-4 mr-2" />
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center">
                    <ChevronsRight className="w-4 h-4 mr-2" />
                    Line Item Details
                  </TabsTrigger>
                  <TabsTrigger value="financial" className="flex items-center">
                    <BarChart className="w-4 h-4 mr-2" />
                    Financial
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center p-3 bg-slate-50/50 rounded-md border">
                      <div className="text-center w-full">
                        <div className="flex justify-center space-x-6">
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600">{differences.addedItems}</div>
                            <div className="text-xs text-muted-foreground">Items Added</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-red-600">{differences.removedItems}</div>
                            <div className="text-xs text-muted-foreground">Items Removed</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs flex items-center"
                        onClick={() => onRevisionSelect(compareRevision.id)}
                      >
                        Switch to Version {compareRevision.version}
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-0">
                  <RevisionDetailedComparison 
                    estimateId={estimateId}
                    currentRevisionId={currentRevisionId}
                    compareRevisionId={compareRevisionId}
                  />
                </TabsContent>
                
                <TabsContent value="financial" className="mt-0">
                  <RevisionFinancialComparison
                    estimateId={estimateId}
                    currentRevisionId={currentRevisionId}
                    compareRevisionId={compareRevisionId}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            {activeTab === "summary" && (
              <div className="mt-3 text-center">
                <Button
                  variant="link"
                  size="sm"
                  className="text-xs text-[#0485ea]"
                  onClick={() => setActiveTab('details')}
                >
                  View detailed comparison
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-muted-foreground">Select a revision to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevisionComparePanel;
