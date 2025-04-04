
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost: number;
  markup_percentage: number;
  item_type: string;
}

interface EstimateRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  currentVersion: number;
  onSuccess?: () => void;
}

const EstimateRevisionDialog: React.FC<EstimateRevisionDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  currentVersion,
  onSuccess
}) => {
  const [notes, setNotes] = useState('');
  const [copyAllItems, setCopyAllItems] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();

  // Fetch the current items when dialog opens
  useEffect(() => {
    if (open && !copyAllItems) {
      fetchCurrentItems();
    }
  }, [open, copyAllItems]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setNotes('');
      setCopyAllItems(true);
      setShowItemSelection(false);
      setLoading(true);
      fetchCurrentItems();
    }
  }, [open]);

  const fetchCurrentItems = async () => {
    setLoading(true);
    try {
      // First fetch the current revision
      const { data: revision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .select('id')
        .eq('estimate_id', estimateId)
        .eq('is_current', true)
        .single();

      if (revisionError) throw revisionError;
      
      if (revision) {
        setCurrentRevisionId(revision.id);
        
        // Then fetch the items for this revision
        const { data: itemsData, error: itemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('revision_id', revision.id)
          .order('id');

        if (itemsError) throw itemsError;
        
        if (itemsData) {
          setItems(itemsData);
          
          // Calculate totals
          const total = itemsData.reduce((sum, item) => sum + (item.total_price || 0), 0);
          setTotalAmount(total);
          setTotalItems(itemsData.length);
          
          // Initialize all items as selected
          const initialSelectedState: Record<string, boolean> = {};
          itemsData.forEach(item => {
            initialSelectedState[item.id] = true;
          });
          setSelectedItems(initialSelectedState);
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error fetching items",
        description: "Could not load estimate items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelectionToggle = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const toggleAllItems = (selected: boolean) => {
    const newSelectedState: Record<string, boolean> = {};
    items.forEach(item => {
      newSelectedState[item.id] = selected;
    });
    setSelectedItems(newSelectedState);
  };

  const handleCopyAllChange = (checked: boolean) => {
    setCopyAllItems(checked);
    if (!checked && items.length === 0) {
      fetchCurrentItems();
    }
    setShowItemSelection(!checked);
  };

  const getSelectedItemCount = () => {
    return Object.values(selectedItems).filter(selected => selected).length;
  };

  const getSelectedItemsTotal = () => {
    return items
      .filter(item => selectedItems[item.id])
      .reduce((sum, item) => sum + (item.total_price || 0), 0);
  };

  const handleCreateRevision = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // 1. Create a new revision with incremented version number
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: currentVersion + 1,
          is_current: true,
          status: 'draft',
          notes: notes || `Revision ${currentVersion + 1} created from version ${currentVersion}`,
          revision_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (revisionError) throw revisionError;

      // 2. Update the estimate status to draft if it was sent or approved
      const { error: statusError } = await supabase
        .from('estimates')
        .update({
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('estimateid', estimateId);

      if (statusError) throw statusError;

      // 3. Manually copy selected items if not using automatic copy
      if (!copyAllItems && currentRevisionId) {
        const selectedItemIds = Object.entries(selectedItems)
          .filter(([_, isSelected]) => isSelected)
          .map(([id]) => id);
        
        if (selectedItemIds.length > 0) {
          // Fetch the selected items
          const { data: itemsToCopy, error: fetchError } = await supabase
            .from('estimate_items')
            .select('*')
            .in('id', selectedItemIds);
            
          if (fetchError) throw fetchError;
          
          if (itemsToCopy && itemsToCopy.length > 0) {
            // Prepare items for insertion with new revision ID
            const itemsToInsert = itemsToCopy.map(item => {
              // Create a new item without the ID (will be auto-generated)
              const { id, ...itemWithoutId } = item;
              return {
                ...itemWithoutId,
                revision_id: newRevision.id,
                original_item_id: id, // Set reference to the original item
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            });
            
            // Insert the items
            const { error: insertError } = await supabase
              .from('estimate_items')
              .insert(itemsToInsert);
              
            if (insertError) throw insertError;
          }
        }
      }

      toast({
        title: "Revision created successfully",
        description: `Created version ${currentVersion + 1} of this estimate.`,
        className: "bg-[#0485ea] text-white",
      });

      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating estimate revision:", error);
      toast({
        title: "Error creating revision",
        description: error.message || "Failed to create a new revision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Revision</DialogTitle>
          <DialogDescription>
            Create a new version of this estimate. The current version {currentVersion} will be preserved in the revision history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="revisionNotes">Revision Notes</Label>
              <Textarea
                id="revisionNotes"
                placeholder="Add notes describing the changes in this revision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-md my-4">
              <h3 className="text-sm font-medium mb-2">Current Version Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Items:</span>
                  <span className="ml-2 font-medium">{totalItems}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="ml-2 font-medium">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="copyItems"
                checked={copyAllItems}
                onCheckedChange={(checked) => handleCopyAllChange(checked as boolean)}
              />
              <Label htmlFor="copyItems" className="cursor-pointer">
                Copy all items from previous version
              </Label>
            </div>
            
            {!copyAllItems && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Select items to copy</Label>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleAllItems(true)}
                    >
                      Select All
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleAllItems(false)}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : items.length > 0 ? (
                  <>
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Select</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[80px] text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedItems[item.id] || false}
                                  onCheckedChange={() => handleItemSelectionToggle(item.id)}
                                />
                              </TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-md mt-4 text-sm">
                      <div className="flex justify-between">
                        <span>Selected Items: {getSelectedItemCount()} of {items.length}</span>
                        <span>Selected Total: ${getSelectedItemsTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground border rounded-md">
                    No items found in the current version
                  </div>
                )}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              After creating this revision, you'll be able to edit all details and line items.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRevision}
            disabled={isSubmitting}
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Revision'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionDialog;
