import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  newRevisionId,
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

        // Process new items
        (newItems || []).forEach((newItem: any) => {
          const trackingId = newItem.original_item_id || newItem.id;
          const oldItem = oldItemMap.get(trackingId);

          if (oldItem) {
            // Item exists in both revisions - check if changed
            const comparison: ItemComparison = {
              id: trackingId,
              description: newItem.description || 'Untitled item',
              oldQuantity: oldItem.quantity,
              oldUnitPrice: oldItem.unit_price,
              oldTotalPrice: oldItem.quantity * oldItem.unit_price,
              newQuantity: newItem.quantity,
              newUnitPrice: newItem.unit_price,
              newTotalPrice: newItem.quantity * newItem.unit_price,
              status: 'unchanged',
            };

            // Check if any values changed
            if (
              oldItem.quantity !== newItem.quantity ||
              oldItem.unit_price !== newItem.unit_price ||
              oldItem.description !== newItem.description
            ) {
              comparison.status = 'changed';
            }

            comparisons.push(comparison);

            // Remove from old map to track what's been processed
            oldItemMap.delete(trackingId);
          } else {
            // Item only in new revision
            comparisons.push({
              id: trackingId,
              description: newItem.description || 'Untitled item',
              newQuantity: newItem.quantity,
              newUnitPrice: newItem.unit_price,
              newTotalPrice: newItem.quantity * newItem.unit_price,
              status: 'added',
            });
          }
        });

        // Remaining old items are those not in new revision
        oldItemMap.forEach((item: any) => {
          const trackingId = item.original_item_id || item.id;
          comparisons.push({
            id: trackingId,
            description: item.description || 'Untitled item',
            oldQuantity: item.quantity,
            oldUnitPrice: item.unit_price,
            oldTotalPrice: item.quantity * item.unit_price,
            status: 'removed',
          });
        });
      } else {
        // No old revision to compare against, all items are new
        comparisons = (newItems || []).map((item: any) => ({
          id: item.id,
          description: item.description || 'Untitled item',
          newQuantity: item.quantity,
          newUnitPrice: item.unit_price,
          newTotalPrice: item.quantity * item.unit_price,
          status: 'added',
        }));
      }

      setItemComparisons(comparisons);
    } catch (error) {
      console.error('Error fetching revision data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Revision Comparison</DialogTitle>
          <DialogDescription>Compare changes between estimate revisions</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">
                  {oldRevision ? `Revision ${oldRevision.version}` : 'Initial State'}
                </h3>
                {oldRevision && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(oldRevision.revision_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">
                  {newRevision ? `Revision ${newRevision.version}` : 'Current State'}
                </h3>
                {newRevision && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(newRevision.revision_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-right">Previous</th>
                    <th className="p-2 text-right">Current</th>
                    <th className="p-2 text-right">Change</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {itemComparisons.map(item => {
                    const oldPrice = item.oldTotalPrice || 0;
                    const newPrice = item.newTotalPrice || 0;
                    const priceDiff = newPrice - oldPrice;

                    return (
                      <tr
                        key={item.id}
                        className={
                          item.status === 'added'
                            ? 'bg-green-50'
                            : item.status === 'removed'
                              ? 'bg-red-50'
                              : item.status === 'changed'
                                ? 'bg-blue-50'
                                : ''
                        }
                      >
                        <td className="p-2 border-t">{item.description}</td>
                        <td className="p-2 border-t text-right">
                          {item.oldTotalPrice !== undefined ? (
                            <>
                              <div>{formatCurrency(item.oldTotalPrice)}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.oldQuantity} × {formatCurrency(item.oldUnitPrice || 0)}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-2 border-t text-right">
                          {item.newTotalPrice !== undefined ? (
                            <>
                              <div>{formatCurrency(item.newTotalPrice)}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.newQuantity} × {formatCurrency(item.newUnitPrice || 0)}
                              </div>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-2 border-t text-right">
                          {item.oldTotalPrice !== undefined && item.newTotalPrice !== undefined ? (
                            <div
                              className={
                                priceDiff > 0
                                  ? 'text-green-600'
                                  : priceDiff < 0
                                    ? 'text-red-600'
                                    : ''
                              }
                            >
                              {priceDiff > 0 ? '+' : ''}
                              {formatCurrency(priceDiff)}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-2 border-t text-center">
                          <div
                            className={`
                            inline-block px-2 py-1 rounded-full text-xs font-medium
                            ${
                              item.status === 'added'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'removed'
                                  ? 'bg-red-100 text-red-800'
                                  : item.status === 'changed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                            }
                          `}
                          >
                            {item.status === 'added'
                              ? 'Added'
                              : item.status === 'removed'
                                ? 'Removed'
                                : item.status === 'changed'
                                  ? 'Modified'
                                  : 'Unchanged'}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {itemComparisons.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No items to compare or no changes between revisions.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-right">
                      {formatCurrency(
                        itemComparisons.reduce((sum, item) => sum + (item.oldTotalPrice || 0), 0)
                      )}
                    </th>
                    <th className="p-2 text-right">
                      {formatCurrency(
                        itemComparisons.reduce((sum, item) => sum + (item.newTotalPrice || 0), 0)
                      )}
                    </th>
                    <th className="p-2 text-right">
                      {formatCurrency(
                        itemComparisons.reduce(
                          (sum, item) =>
                            sum + ((item.newTotalPrice || 0) - (item.oldTotalPrice || 0)),
                          0
                        )
                      )}
                    </th>
                    <th></th>
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
