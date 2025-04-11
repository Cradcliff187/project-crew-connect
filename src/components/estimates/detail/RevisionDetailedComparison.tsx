
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRightLeft, Plus, Minus, Edit, ArrowDown, ArrowUp, 
  ChevronDown, ChevronUp, Filter 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EstimateItem, EstimateRevision, RevisionComparisonField } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RevisionDetailedComparisonProps {
  estimateId: string;
  currentRevisionId: string;
  compareRevisionId: string;
}

const RevisionDetailedComparison: React.FC<RevisionDetailedComparisonProps> = ({
  estimateId,
  currentRevisionId,
  compareRevisionId
}) => {
  const [currentRevision, setCurrentRevision] = useState<EstimateRevision | null>(null);
  const [compareRevision, setCompareRevision] = useState<EstimateRevision | null>(null);
  const [currentItems, setCurrentItems] = useState<EstimateItem[]>([]);
  const [compareItems, setCompareItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<EstimateItem[]>([]);
  const [removedItems, setRemovedItems] = useState<EstimateItem[]>([]);
  const [changedItems, setChangedItems] = useState<any[]>([]);
  const [showSection, setShowSection] = useState<'all' | 'added' | 'removed' | 'modified'>('all');
  const [sortField, setSortField] = useState<keyof EstimateItem>('description');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Define the comparison fields
  const comparisonFields: RevisionComparisonField[] = [
    { label: 'Description', field: 'description' },
    { label: 'Quantity', field: 'quantity' },
    { label: 'Unit Price', field: 'unit_price', formatter: formatCurrency, showDifference: true },
    { label: 'Total', field: 'total_price', formatter: formatCurrency, showDifference: true }
  ];
  
  useEffect(() => {
    if (currentRevisionId && compareRevisionId) {
      fetchData();
    }
  }, [currentRevisionId, compareRevisionId]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch revisions
      const { data: revCurrentData, error: revCurrentError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', currentRevisionId)
        .single();
        
      if (revCurrentError) throw revCurrentError;
      setCurrentRevision(revCurrentData);
      
      const { data: revCompareData, error: revCompareError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', compareRevisionId)
        .single();
        
      if (revCompareError) throw revCompareError;
      setCompareRevision(revCompareData);
      
      // Fetch items for both revisions
      const { data: currentItemsData, error: currentItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevisionId);
        
      if (currentItemsError) throw currentItemsError;
      // Type safe conversion of database items to EstimateItem[]
      const typeSafeCurrentItems: EstimateItem[] = (currentItemsData || []).map(item => ({
        ...item,
        item_type: (item.item_type || 'other') as 'labor' | 'material' | 'subcontractor' | 'vendor' | 'other'
      }));
      setCurrentItems(typeSafeCurrentItems);
      
      const { data: compareItemsData, error: compareItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', compareRevisionId);
        
      if (compareItemsError) throw compareItemsError;
      // Type safe conversion of database items to EstimateItem[]
      const typeSafeCompareItems: EstimateItem[] = (compareItemsData || []).map(item => ({
        ...item,
        item_type: (item.item_type || 'other') as 'labor' | 'material' | 'subcontractor' | 'vendor' | 'other'
      }));
      setCompareItems(typeSafeCompareItems);
      
      // Process comparison data
      processComparisonData(typeSafeCurrentItems, typeSafeCompareItems);
    } catch (error) {
      console.error('Error fetching revision data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const processComparisonData = (current: EstimateItem[], compare: EstimateItem[]) => {
    // Find added items (in current but not in compare)
    const added = current.filter(item => !compare.some(ci => 
      ci.description === item.description || ci.original_item_id === item.id || ci.id === item.original_item_id));
    setAddedItems(added);
    
    // Find removed items (in compare but not in current)
    const removed = compare.filter(item => !current.some(ci => 
      ci.description === item.description || ci.original_item_id === item.id || ci.id === item.original_item_id));
    setRemovedItems(removed);
    
    // Find changed items
    const changed = current.map(currentItem => {
      const previousItem = compare.find(ci => 
        ci.description === currentItem.description || 
        ci.id === currentItem.original_item_id ||
        ci.original_item_id === currentItem.original_item_id);
      
      if (previousItem && (
        currentItem.quantity !== previousItem.quantity || 
        currentItem.unit_price !== previousItem.unit_price ||
        currentItem.total_price !== previousItem.total_price
      )) {
        // Calculate differences
        const priceDifference = currentItem.total_price - previousItem.total_price;
        const percentageDifference = previousItem.total_price !== 0 
          ? (priceDifference / previousItem.total_price) * 100 
          : 0;
        
        // Identify specific changes
        const changes = [];
        
        if (currentItem.quantity !== previousItem.quantity) {
          changes.push({
            field: 'quantity',
            previousValue: previousItem.quantity,
            currentValue: currentItem.quantity
          });
        }
        
        if (currentItem.unit_price !== previousItem.unit_price) {
          changes.push({
            field: 'unit_price',
            previousValue: previousItem.unit_price,
            currentValue: currentItem.unit_price
          });
        }
        
        return {
          current: currentItem,
          previous: previousItem,
          priceDifference,
          percentageDifference,
          changes
        };
      }
      return null;
    }).filter(Boolean);
    
    setChangedItems(changed);
  };
  
  const handleSort = (field: keyof EstimateItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortItems = (items: EstimateItem[]) => {
    return [...items].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : 1;
      } else {
        return aValue > bValue ? -1 : 1;
      }
    });
  };
  
  // Calculate summary numbers
  const totalNewItemsCost = addedItems.reduce((sum, item) => sum + item.total_price, 0);
  const totalRemovedItemsCost = removedItems.reduce((sum, item) => sum + item.total_price, 0);
  const totalChangedItemsDifference = changedItems.reduce((sum, item) => sum + item.priceDifference, 0);
  const netDifference = totalNewItemsCost - totalRemovedItemsCost + totalChangedItemsDifference;
  const percentageChange = compareRevision?.amount && compareRevision.amount > 0
    ? (netDifference / compareRevision.amount) * 100
    : 0;
  
  if (loading || !currentRevision || !compareRevision) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            Loading comparison data...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <ArrowRightLeft className="mr-2 h-5 w-5 text-[#0485ea]" />
            Detailed Revision Comparison
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={showSection} onValueChange={(value: any) => setShowSection(value)}>
              <SelectTrigger className="w-[160px] h-8">
                <div className="flex items-center">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Show" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Changes</SelectItem>
                <SelectItem value="added">Added Items</SelectItem>
                <SelectItem value="removed">Removed Items</SelectItem>
                <SelectItem value="modified">Modified Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-md border">
            <div className="text-sm text-muted-foreground mb-1">Total Difference</div>
            <div className={`text-xl font-medium ${netDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netDifference)}
            </div>
            <div className="text-xs mt-1">
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md border border-green-100">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Plus className="h-3.5 w-3.5 mr-1 text-green-500" />
              Added Items
            </div>
            <div className="text-xl font-medium text-green-600">
              {formatCurrency(totalNewItemsCost)}
            </div>
            <div className="text-xs mt-1">{addedItems.length} items</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Minus className="h-3.5 w-3.5 mr-1 text-red-500" />
              Removed Items
            </div>
            <div className="text-xl font-medium text-red-600">
              {formatCurrency(totalRemovedItemsCost)}
            </div>
            <div className="text-xs mt-1">{removedItems.length} items</div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
            <div className="flex items-center text-sm text-muted-foreground mb-1">
              <Edit className="h-3.5 w-3.5 mr-1 text-blue-500" />
              Modified Items
            </div>
            <div className={`text-xl font-medium ${totalChangedItemsDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalChangedItemsDifference)}
            </div>
            <div className="text-xs mt-1">{changedItems.length} items</div>
          </div>
        </div>
        
        {/* Detailed comparison tables */}
        <div className="space-y-6">
          {/* Added Items */}
          {(showSection === 'all' || showSection === 'added') && addedItems.length > 0 && (
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full p-3 bg-green-50 border border-green-100 rounded-md">
                  <div className="flex items-center">
                    <Plus className="h-4 w-4 mr-2 text-green-600" />
                    <h3 className="font-medium">Added Items ({addedItems.length})</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {comparisonFields.map(field => (
                        <TableHead
                          key={field.field.toString()}
                          className={field.field === 'total_price' ? 'text-right' : ''}
                          onClick={() => handleSort(field.field)}
                        >
                          <div className="flex items-center">
                            {field.label}
                            {sortField === field.field && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortItems(addedItems).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          +{formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-green-50">
                      <TableCell colSpan={3} className="font-medium">
                        Total Added
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        +{formatCurrency(totalNewItemsCost)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Removed Items */}
          {(showSection === 'all' || showSection === 'removed') && removedItems.length > 0 && (
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full p-3 bg-red-50 border border-red-100 rounded-md">
                  <div className="flex items-center">
                    <Minus className="h-4 w-4 mr-2 text-red-600" />
                    <h3 className="font-medium">Removed Items ({removedItems.length})</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {comparisonFields.map(field => (
                        <TableHead
                          key={field.field.toString()}
                          className={field.field === 'total_price' ? 'text-right' : ''}
                          onClick={() => handleSort(field.field)}
                        >
                          <div className="flex items-center">
                            {field.label}
                            {sortField === field.field && (
                              sortDirection === 'asc' ? 
                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortItems(removedItems).map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          -{formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-red-50">
                      <TableCell colSpan={3} className="font-medium">
                        Total Removed
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        -{formatCurrency(totalRemovedItemsCost)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          {/* Modified Items */}
          {(showSection === 'all' || showSection === 'modified') && changedItems.length > 0 && (
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between w-full p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center">
                    <Edit className="h-4 w-4 mr-2 text-blue-600" />
                    <h3 className="font-medium">Modified Items ({changedItems.length})</h3>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Previous Value</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changedItems.map(item => (
                      <>
                        <TableRow key={`${item.current.id}-header`} className="bg-slate-50">
                          <TableCell colSpan={5} className="py-1">
                            <div className="font-medium">
                              {item.current.description}
                              <Badge variant="outline" className="ml-2 text-xs">
                                {formatCurrency(item.priceDifference)} ({item.percentageDifference > 0 ? '+' : ''}{item.percentageDifference.toFixed(1)}%)
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                        {item.changes.map((change, idx) => (
                          <TableRow key={`${item.current.id}-${change.field}-${idx}`}>
                            <TableCell></TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {change.field === 'unit_price' ? 'Unit Price' : 
                                 change.field === 'quantity' ? 'Quantity' : 
                                 change.field}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {change.field === 'unit_price' 
                                ? formatCurrency(change.previousValue) 
                                : change.previousValue}
                            </TableCell>
                            <TableCell>
                              {change.field === 'unit_price' 
                                ? formatCurrency(change.currentValue) 
                                : change.currentValue}
                            </TableCell>
                            <TableCell className="text-right">
                              {change.field === 'unit_price' && (
                                <span className={change.currentValue > change.previousValue ? 'text-green-600' : 'text-red-600'}>
                                  {change.currentValue > change.previousValue ? '+' : ''}
                                  {formatCurrency(change.currentValue - change.previousValue)}
                                </span>
                              )}
                              
                              {change.field === 'quantity' && (
                                <span className={change.currentValue > change.previousValue ? 'text-green-600' : 'text-red-600'}>
                                  {change.currentValue > change.previousValue ? '+' : ''}
                                  {change.currentValue - change.previousValue}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow key={`${item.current.id}-total`}>
                          <TableCell></TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              Total Price
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(item.previous.total_price)}</TableCell>
                          <TableCell>{formatCurrency(item.current.total_price)}</TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={item.priceDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.priceDifference > 0 ? '+' : ''}
                              {formatCurrency(item.priceDifference)}
                            </span>
                          </TableCell>
                        </TableRow>
                      </>
                    ))}
                    <TableRow className="bg-blue-50">
                      <TableCell colSpan={4} className="font-medium">
                        Total Modified
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={totalChangedItemsDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {totalChangedItemsDifference > 0 ? '+' : ''}
                          {formatCurrency(totalChangedItemsDifference)}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevisionDetailedComparison;
