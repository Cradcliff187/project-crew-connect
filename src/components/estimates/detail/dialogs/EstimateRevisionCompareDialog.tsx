
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { EstimateRevision } from '../../types/estimateTypes';

interface ComparisonItem {
  description: string;
  oldQuantity?: number;
  newQuantity?: number;
  oldUnitPrice?: number;
  newUnitPrice?: number;
  oldTotal?: number;
  newTotal?: number;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
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
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [oldRevision, setOldRevision] = useState<EstimateRevision | null>(null);
  const [newRevision, setNewRevision] = useState<EstimateRevision | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadRevisionData();
    }
  }, [open, oldRevisionId, newRevisionId]);

  const loadRevisionData = async () => {
    setLoading(true);
    try {
      // If no oldRevisionId is provided, get the previous version of the current revision
      if (!oldRevisionId) {
        if (!newRevisionId) {
          throw new Error("At least one revision ID must be provided");
        }

        // Get the new revision first to find its version
        const { data: newRevData, error: newRevError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('id', newRevisionId)
          .single();

        if (newRevError) throw newRevError;
        setNewRevision(newRevData);

        // Find the previous version
        const { data: prevRevData, error: prevRevError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('estimate_id', estimateId)
          .eq('version', newRevData.version - 1)
          .single();

        if (!prevRevError && prevRevData) {
          setOldRevision(prevRevData);
          oldRevisionId = prevRevData.id;
        } else {
          // If there's no previous version, we'll just show the new items as "added"
          setOldRevision(null);
        }
      } else {
        // Get old revision data
        const { data: oldRevData, error: oldRevError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('id', oldRevisionId)
          .single();

        if (oldRevError) throw oldRevError;
        setOldRevision(oldRevData);

        // Get new revision data
        const { data: newRevData, error: newRevError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('id', newRevisionId)
          .single();

        if (newRevError) throw newRevError;
        setNewRevision(newRevData);
      }

      // Get items from both revisions
      const oldItemsPromise = oldRevisionId 
        ? supabase
            .from('estimate_items')
            .select('*')
            .eq('revision_id', oldRevisionId)
        : Promise.resolve({ data: [], error: null });

      const newItemsPromise = supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', newRevisionId);

      const [oldItemsResult, newItemsResult] = await Promise.all([oldItemsPromise, newItemsPromise]);

      if (oldItemsResult.error) throw oldItemsResult.error;
      if (newItemsResult.error) throw newItemsResult.error;

      const oldItems = oldItemsResult.data || [];
      const newItems = newItemsResult.data || [];

      // Compare items and build the comparison data
      const comparison: ComparisonItem[] = [];
      
      // First, handle items that are in both revisions or only in the old revision
      oldItems.forEach(oldItem => {
        const newItem = newItems.find(item => item.description === oldItem.description);
        
        if (newItem) {
          // Item exists in both revisions
          const hasChanged = 
            oldItem.quantity !== newItem.quantity || 
            oldItem.unit_price !== newItem.unit_price || 
            oldItem.total_price !== newItem.total_price;
          
          comparison.push({
            description: oldItem.description,
            oldQuantity: oldItem.quantity,
            newQuantity: newItem.quantity,
            oldUnitPrice: oldItem.unit_price,
            newUnitPrice: newItem.unit_price,
            oldTotal: oldItem.total_price,
            newTotal: newItem.total_price,
            status: hasChanged ? 'changed' : 'unchanged'
          });
        } else {
          // Item only in old revision (removed)
          comparison.push({
            description: oldItem.description,
            oldQuantity: oldItem.quantity,
            oldUnitPrice: oldItem.unit_price,
            oldTotal: oldItem.total_price,
            status: 'removed'
          });
        }
      });
      
      // Handle items that are only in the new revision (added)
      newItems.forEach(newItem => {
        const existsInOld = oldItems.some(item => item.description === newItem.description);
        if (!existsInOld) {
          comparison.push({
            description: newItem.description,
            newQuantity: newItem.quantity,
            newUnitPrice: newItem.unit_price,
            newTotal: newItem.total_price,
            status: 'added'
          });
        }
      });
      
      setComparisonItems(comparison);
    } catch (error: any) {
      console.error("Error comparing revisions:", error);
      toast({
        title: "Error loading comparison",
        description: error.message || "Could not load revision comparison data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'bg-green-50 border-l-4 border-l-green-500';
      case 'removed': return 'bg-red-50 border-l-4 border-l-red-500';
      case 'changed': return 'bg-amber-50 border-l-4 border-l-amber-500';
      default: return '';
    }
  };

  const getValueChangeClass = (oldValue?: number, newValue?: number) => {
    if (oldValue === undefined || newValue === undefined) return '';
    if (oldValue < newValue) return 'text-green-600';
    if (oldValue > newValue) return 'text-red-600';
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Revision Comparison</DialogTitle>
          <DialogDescription>
            {oldRevision && newRevision ? (
              <>
                Compare changes between Version {oldRevision.version} and Version {newRevision.version}
              </>
            ) : newRevision ? (
              <>
                New items in Version {newRevision.version}
              </>
            ) : (
              'Loading revision data...'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comparisonItems.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No differences found between these revisions.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total Price</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonItems.map((item, index) => (
                  <TableRow key={index} className={getStatusColor(item.status)}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.status === 'changed' ? (
                        <div>
                          <span className="line-through text-muted-foreground mr-2">
                            {item.oldQuantity}
                          </span>
                          <span className={getValueChangeClass(item.oldQuantity, item.newQuantity)}>
                            {item.newQuantity}
                          </span>
                        </div>
                      ) : item.status === 'removed' ? (
                        item.oldQuantity
                      ) : (
                        item.newQuantity
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'changed' ? (
                        <div>
                          <span className="line-through text-muted-foreground mr-2">
                            {formatCurrency(item.oldUnitPrice || 0)}
                          </span>
                          <span className={getValueChangeClass(item.oldUnitPrice, item.newUnitPrice)}>
                            {formatCurrency(item.newUnitPrice || 0)}
                          </span>
                        </div>
                      ) : item.status === 'removed' ? (
                        formatCurrency(item.oldUnitPrice || 0)
                      ) : (
                        formatCurrency(item.newUnitPrice || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'changed' ? (
                        <div>
                          <span className="line-through text-muted-foreground mr-2">
                            {formatCurrency(item.oldTotal || 0)}
                          </span>
                          <span className={getValueChangeClass(item.oldTotal, item.newTotal)}>
                            {formatCurrency(item.newTotal || 0)}
                          </span>
                        </div>
                      ) : item.status === 'removed' ? (
                        formatCurrency(item.oldTotal || 0)
                      ) : (
                        formatCurrency(item.newTotal || 0)
                      )}
                    </TableCell>
                    <TableCell>
                      {item.status === 'added' && <span className="text-green-600">Added</span>}
                      {item.status === 'removed' && <span className="text-red-600">Removed</span>}
                      {item.status === 'changed' && <span className="text-amber-600">Changed</span>}
                      {item.status === 'unchanged' && <span className="text-muted-foreground">Unchanged</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionCompareDialog;
