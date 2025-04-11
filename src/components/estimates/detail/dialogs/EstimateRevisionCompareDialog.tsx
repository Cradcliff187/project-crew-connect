import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface EstimateRevisionCompareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  oldRevisionId?: string;
  newRevisionId: string;
}

interface ItemComparison {
  id: string;
  description: string;
  oldQuantity?: number;
  oldUnitPrice?: number;
  oldTotalPrice?: number;
  newQuantity?: number;
  newUnitPrice?: number;
  newTotalPrice?: number;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
}

const EstimateRevisionCompareDialog: React.FC<EstimateRevisionCompareDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  oldRevisionId,
  newRevisionId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [itemComparisons, setItemComparisons] = useState<ItemComparison[]>([]);
  const [oldRevision, setOldRevision] = useState<any>(null);
  const [newRevision, setNewRevision] = useState<any>(null);

  useEffect(() => {
    if (open && newRevisionId) {
      fetchRevisions();
    }
  }, [open, newRevisionId, oldRevisionId]);

  const fetchRevisions = async () => {
    if (!newRevisionId) return;
    
    setIsLoading(true);
    try {
      const { data: newRevData, error: newRevError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', newRevisionId)
        .single();
      
      if (newRevError) throw newRevError;
      setNewRevision(newRevData);
      
      if (oldRevisionId) {
        const { data: oldRevData, error: oldRevError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('id', oldRevisionId)
          .single();
        
        if (oldRevError) throw oldRevError;
        setOldRevision(oldRevData);
      }
      
      const { data: newItems, error: newItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', newRevisionId);
      
      if (newItemsError) throw newItemsError;
      
      let comparisons: ItemComparison[] = [];
      
      if (oldRevisionId) {
        const { data: oldItems, error: oldItemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('revision_id', oldRevisionId);
        
        if (oldItemsError) throw oldItemsError;
        
        const oldItemMap = new Map();
        (oldItems || []).forEach((item: any) => {
          const trackingId = item.original_item_id || item.id;
          oldItemMap.set(trackingId, item);
        });
        
        (newItems || []).forEach((newItem: any) => {
          const trackingId = newItem.original_item_id || newItem.id;
          const oldItem = oldItemMap.get(trackingId);
          
          if (oldItem) {
            const hasChanged = 
              newItem.description !== oldItem.description ||
              newItem.quantity !== oldItem.quantity ||
              newItem.unit_price !== oldItem.unit_price ||
              newItem.total_price !== oldItem.total_price;
              
            comparisons.push({
              id: newItem.id,
              description: newItem.description,
              oldQuantity: oldItem.quantity,
              oldUnitPrice: oldItem.unit_price,
              oldTotalPrice: oldItem.total_price,
              newQuantity: newItem.quantity,
              newUnitPrice: newItem.unit_price,
              newTotalPrice: newItem.total_price,
              status: hasChanged ? 'changed' : 'unchanged'
            });
            
            oldItemMap.delete(trackingId);
          } else {
            comparisons.push({
              id: newItem.id,
              description: newItem.description,
              newQuantity: newItem.quantity,
              newUnitPrice: newItem.unit_price,
              newTotalPrice: newItem.total_price,
              status: 'added'
            });
          }
        });
        
        oldItemMap.forEach((oldItem: any) => {
          comparisons.push({
            id: oldItem.id,
            description: oldItem.description,
            oldQuantity: oldItem.quantity,
            oldUnitPrice: oldItem.unit_price,
            oldTotalPrice: oldItem.total_price,
            status: 'removed'
          });
        });
      } else {
        (newItems || []).forEach((item: any) => {
          comparisons.push({
            id: item.id,
            description: item.description,
            newQuantity: item.quantity,
            newUnitPrice: item.unit_price,
            newTotalPrice: item.total_price,
            status: 'added'
          });
        });
      }
      
      comparisons = comparisons.sort((a, b) => {
        const statusOrder = { added: 0, changed: 1, unchanged: 2, removed: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      setItemComparisons(comparisons);
    } catch (error) {
      console.error('Error fetching revision data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'added':
        return 'bg-green-50 text-green-700';
      case 'removed':
        return 'bg-red-50 text-red-700';
      case 'changed':
        return 'bg-amber-50 text-amber-700';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'added':
        return 'Added';
      case 'removed':
        return 'Removed';
      case 'changed':
        return 'Changed';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Compare Revisions</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
            <span className="ml-2">Loading comparison data...</span>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pr-2">
            <div className="flex justify-between text-sm mb-4">
              <div>
                <p className="font-semibold">
                  {oldRevision ? `Version ${oldRevision.version}` : 'No previous version'}
                </p>
                {oldRevision && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(oldRevision.revision_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">Version {newRevision?.version || 'Unknown'}</p>
                {newRevision && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(newRevision?.revision_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-3 text-left">Item</th>
                    <th className="py-2 px-3 text-right">Old Value</th>
                    <th className="py-2 px-3 text-right">New Value</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itemComparisons.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="py-2 px-3">{item.description}</td>
                      <td className="py-2 px-3 text-right">
                        {item.oldTotalPrice !== undefined ? (
                          <>
                            <div>{formatCurrency(item.oldTotalPrice)}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.oldQuantity} x {formatCurrency(item.oldUnitPrice || 0)}
                            </div>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.newTotalPrice !== undefined ? (
                          <>
                            <div>{formatCurrency(item.newTotalPrice)}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.newQuantity} x {formatCurrency(item.newUnitPrice || 0)}
                            </div>
                          </>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs ${getStatusClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {itemComparisons.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        No comparison data available
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted font-medium">
                  <tr>
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3 text-right">
                      {oldRevision?.amount ? formatCurrency(oldRevision.amount) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {newRevision?.amount ? formatCurrency(newRevision.amount) : '-'}
                    </td>
                    <td className="py-2 px-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionCompareDialog;
