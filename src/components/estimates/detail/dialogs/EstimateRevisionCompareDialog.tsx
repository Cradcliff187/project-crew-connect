
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeftRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CompareItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type?: string;
  changeType?: 'added' | 'removed' | 'modified' | 'unchanged';
  original_item_id?: string;
}

interface RevisionInfo {
  version: number;
  revision_date: string;
  status: string;
  notes?: string;
  amount?: number;
}

interface EstimateRevisionCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  oldRevisionId?: string;
  newRevisionId: string;
}

const EstimateRevisionCompareDialog: React.FC<EstimateRevisionCompareDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  oldRevisionId,
  newRevisionId
}) => {
  const [loading, setLoading] = useState(true);
  const [oldItems, setOldItems] = useState<CompareItem[]>([]);
  const [newItems, setNewItems] = useState<CompareItem[]>([]);
  const [oldRevision, setOldRevision] = useState<RevisionInfo | null>(null);
  const [newRevision, setNewRevision] = useState<RevisionInfo | null>(null);
  const [comparedItems, setComparedItems] = useState<CompareItem[]>([]);
  const [oldTotal, setOldTotal] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  useEffect(() => {
    if (open && newRevisionId) {
      fetchRevisionData();
    }
  }, [open, newRevisionId, oldRevisionId]);

  const fetchRevisionData = async () => {
    setLoading(true);
    try {
      const { data: newRevisionData, error: newRevError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', newRevisionId)
        .single();

      if (newRevError) throw newRevError;
      
      if (newRevisionData) {
        setNewRevision({
          version: newRevisionData.version,
          revision_date: newRevisionData.revision_date,
          status: newRevisionData.status,
          notes: newRevisionData.notes,
          amount: newRevisionData.amount
        });

        const { data: newItemsData, error: newItemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('revision_id', newRevisionId)
          .order('id');

        if (newItemsError) throw newItemsError;
        
        if (newItemsData) {
          setNewItems(newItemsData);
          const newItemsTotal = newItemsData.reduce(
            (sum, item) => sum + (item.total_price || 0), 
            0
          );
          setNewTotal(newItemsTotal);
        }
      }

      if (oldRevisionId) {
        const { data: oldRevisionData, error: oldRevError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('id', oldRevisionId)
          .single();
  
        if (oldRevError) throw oldRevError;
        
        if (oldRevisionData) {
          setOldRevision({
            version: oldRevisionData.version,
            revision_date: oldRevisionData.revision_date,
            status: oldRevisionData.status,
            notes: oldRevisionData.notes,
            amount: oldRevisionData.amount
          });
  
          const { data: oldItemsData, error: oldItemsError } = await supabase
            .from('estimate_items')
            .select('*')
            .eq('revision_id', oldRevisionId)
            .order('id');
  
          if (oldItemsError) throw oldItemsError;
          
          if (oldItemsData) {
            setOldItems(oldItemsData);
            const oldItemsTotal = oldItemsData.reduce(
              (sum, item) => sum + (item.total_price || 0), 
              0
            );
            setOldTotal(oldItemsTotal);
          }
        }
      }
      
      else {
        if (newRevisionData && newRevisionData.version > 1) {
          const { data: prevRevision, error: prevRevError } = await supabase
            .from('estimate_revisions')
            .select('*')
            .eq('estimate_id', estimateId)
            .eq('version', newRevisionData.version - 1)
            .single();

          if (!prevRevError && prevRevision) {
            setOldRevision({
              version: prevRevision.version,
              revision_date: prevRevision.revision_date,
              status: prevRevision.status,
              notes: prevRevision.notes,
              amount: prevRevision.amount
            });

            const { data: oldItemsData, error: oldItemsError } = await supabase
              .from('estimate_items')
              .select('*')
              .eq('revision_id', prevRevision.id)
              .order('id');

            if (!oldItemsError && oldItemsData) {
              setOldItems(oldItemsData);
              const oldItemsTotal = oldItemsData.reduce(
                (sum, item) => sum + (item.total_price || 0), 
                0
              );
              setOldTotal(oldItemsTotal);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching revision data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newItems.length > 0) {
      const compared: CompareItem[] = [];
      
      newItems.forEach(newItem => {
        let changeType: 'added' | 'modified' | 'unchanged' = 'added';
        let oldItemMatch: CompareItem | undefined;
        
        if (newItem.original_item_id) {
          oldItemMatch = oldItems.find(old => old.id === newItem.original_item_id);
          if (oldItemMatch) {
            changeType = itemsEqual(newItem, oldItemMatch) ? 'unchanged' : 'modified';
          }
        } else {
          oldItemMatch = oldItems.find(old => old.description === newItem.description);
          if (oldItemMatch) {
            changeType = itemsEqual(newItem, oldItemMatch) ? 'unchanged' : 'modified';
          }
        }

        compared.push({
          ...newItem,
          changeType
        });
      });
      
      oldItems.forEach(oldItem => {
        const exists = newItems.some(
          newItem => newItem.original_item_id === oldItem.id || 
                    (newItem.description === oldItem.description && 
                    !newItem.original_item_id)
        );
        
        if (!exists) {
          compared.push({
            ...oldItem,
            changeType: 'removed'
          });
        }
      });
      
      compared.sort((a, b) => {
        const order = { 'unchanged': 0, 'modified': 1, 'added': 2, 'removed': 3 };
        return (order[a.changeType!] || 0) - (order[b.changeType!] || 0);
      });
      
      setComparedItems(compared);
    }
  }, [newItems, oldItems]);

  const itemsEqual = (item1: CompareItem, item2: CompareItem) => {
    return (
      item1.description === item2.description &&
      item1.quantity === item2.quantity &&
      item1.unit_price === item2.unit_price &&
      item1.total_price === item2.total_price &&
      item1.item_type === item2.item_type
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).format(date);
    } catch (error) {
      return "Invalid date";
    }
  };

  const renderChangeTypeBadge = (changeType?: string) => {
    switch (changeType) {
      case 'added':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Added</Badge>;
      case 'removed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Removed</Badge>;
      case 'modified':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Modified</Badge>;
      case 'unchanged':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Unchanged</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Revisions</DialogTitle>
          <DialogDescription>
            {oldRevision && newRevision ? (
              <>
                Comparing Version {oldRevision.version} ({formatDate(oldRevision.revision_date)}) 
                <ArrowLeftRight className="inline mx-2 h-4 w-4" /> 
                Version {newRevision.version} ({formatDate(newRevision.revision_date)})
              </>
            ) : (
              newRevision && (
                <>Viewing changes in Version {newRevision.version} ({formatDate(newRevision.revision_date)})</>
              )
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2">Loading revision data...</span>
            </div>
          ) : (
            <>
              {oldRevision && (
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Version {oldRevision.version}</h3>
                    <div className="text-xs space-y-1">
                      <p>Date: {formatDate(oldRevision.revision_date)}</p>
                      <p>Status: <span className="capitalize">{oldRevision.status}</span></p>
                      <p>Total: {formatCurrency(oldTotal)}</p>
                      {oldRevision.notes && <p className="text-xs text-muted-foreground mt-2">{oldRevision.notes}</p>}
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Version {newRevision?.version}</h3>
                    <div className="text-xs space-y-1">
                      <p>Date: {formatDate(newRevision?.revision_date)}</p>
                      <p>Status: <span className="capitalize">{newRevision?.status}</span></p>
                      <p>Total: {formatCurrency(newTotal)}</p>
                      {newRevision?.notes && <p className="text-xs text-muted-foreground mt-2">{newRevision.notes}</p>}
                    </div>
                  </div>
                </div>
              )}

              {comparedItems.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm mb-2">
                    <span className="font-medium">
                      Changes Summary: 
                    </span> {" "}
                    <span className="text-green-600">
                      {comparedItems.filter(i => i.changeType === 'added').length} added
                    </span>, {" "}
                    <span className="text-amber-600">
                      {comparedItems.filter(i => i.changeType === 'modified').length} modified
                    </span>, {" "}
                    <span className="text-red-600">
                      {comparedItems.filter(i => i.changeType === 'removed').length} removed
                    </span>
                  </div>
                </div>
              )}

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[80px] text-right">Quantity</TableHead>
                      <TableHead className="w-[100px] text-right">Unit Price</TableHead>
                      <TableHead className="w-[100px] text-right">Total</TableHead>
                      <TableHead className="w-[100px]">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparedItems.length > 0 ? (
                      comparedItems.map((item, index) => (
                        <TableRow key={index} className={
                          item.changeType === 'added' ? 'bg-green-50' : 
                          item.changeType === 'removed' ? 'bg-red-50' : 
                          item.changeType === 'modified' ? 'bg-amber-50' : ''
                        }>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                          <TableCell>
                            {renderChangeTypeBadge(item.changeType)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No changes found between revisions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionCompareDialog;
