import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChangeOrder, ChangeOrderItem } from '@/types/changeOrders';
import { formatCurrency } from '@/lib/utils';

interface ChangeOrderItemsProps {
  form: UseFormReturn<ChangeOrder>;
  changeOrderId?: string;
  isEditing: boolean;
  onUpdated: () => void;
}

const ChangeOrderItems = ({ form, changeOrderId, isEditing, onUpdated }: ChangeOrderItemsProps) => {
  const [items, setItems] = useState<ChangeOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ChangeOrderItem>>({
    description: '',
    quantity: 1,
    unit_price: 0,
    impact_days: 0,
    item_type: 'LABOR',
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [impactDays, setImpactDays] = useState(0);

  // Define item types
  const itemTypes = [
    { value: 'LABOR', label: 'Labor' },
    { value: 'MATERIAL', label: 'Material' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    // If we have a change order ID, fetch its items
    if (changeOrderId) {
      fetchItems();
    }
  }, [changeOrderId]);

  useEffect(() => {
    // Update the form with the calculated totals
    form.setValue('total_amount', totalAmount);
    form.setValue('impact_days', impactDays);
  }, [totalAmount, impactDays, form]);

  const fetchItems = async () => {
    if (!changeOrderId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('change_order_items')
        .select('*')
        .eq('change_order_id', changeOrderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setItems(data || []);

      // Calculate totals
      const total = data?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
      setTotalAmount(total);

      // Calculate maximum impact days
      const maxImpactDays =
        data?.reduce((max, item) => Math.max(max, item.impact_days || 0), 0) || 0;
      setImpactDays(maxImpactDays);
    } catch (error: any) {
      console.error('Error fetching change order items:', error);
      toast({
        title: 'Error loading items',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'quantity' || name === 'unit_price' || name === 'impact_days') {
      // Convert to number and ensure it's not negative
      const numValue = Math.max(0, parseFloat(value) || 0);
      setNewItem(prev => ({
        ...prev,
        [name]: numValue,
        // Auto-calculate total price if quantity or unit_price changes
        ...(name === 'quantity' || name === 'unit_price'
          ? {
              total_price:
                (name === 'quantity' ? numValue : prev.quantity || 0) *
                (name === 'unit_price' ? numValue : prev.unit_price || 0),
            }
          : {}),
      }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (value: string) => {
    setNewItem(prev => ({ ...prev, item_type: value }));
  };

  const addItem = async () => {
    if (!changeOrderId) {
      toast({
        title: 'Error',
        description: 'Please save the change order first before adding items',
        variant: 'destructive',
      });
      return;
    }

    if (!newItem.description || !newItem.quantity || !newItem.unit_price) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a description, quantity, and unit price',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Calculate total price
      const totalPrice = (newItem.quantity || 0) * (newItem.unit_price || 0);

      const { data, error } = await supabase
        .from('change_order_items')
        .insert({
          change_order_id: changeOrderId,
          description: newItem.description,
          quantity: newItem.quantity,
          unit_price: newItem.unit_price,
          total_price: totalPrice,
          item_type: newItem.item_type,
          impact_days: newItem.impact_days || 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new item to the list
      setItems(prev => [...prev, data as ChangeOrderItem]);

      // Reset the form
      setNewItem({
        description: '',
        quantity: 1,
        unit_price: 0,
        impact_days: 0,
        item_type: 'LABOR',
      });

      // Recalculate totals
      await fetchItems();
      onUpdated();

      toast({
        title: 'Item added',
        description: 'The item has been added to the change order',
      });
    } catch (error: any) {
      console.error('Error adding change order item:', error);
      toast({
        title: 'Error adding item',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!changeOrderId || !itemId) return;

    if (!confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('change_order_items').delete().eq('id', itemId);

      if (error) throw error;

      // Remove the item from the list
      setItems(prev => prev.filter(item => item.id !== itemId));

      // Recalculate totals
      await fetchItems();
      onUpdated();

      toast({
        title: 'Item deleted',
        description: 'The item has been removed from the change order',
      });
    } catch (error: any) {
      console.error('Error deleting change order item:', error);
      toast({
        title: 'Error deleting item',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing && !changeOrderId && (
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-800">
          Please save the basic information first before adding items.
        </div>
      )}

      {changeOrderId && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newItem.description || ''}
                    onChange={handleInputChange}
                    placeholder="Item description"
                    className="h-10"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="item_type">Type</Label>
                  <Select
                    value={newItem.item_type}
                    onValueChange={handleSelectChange}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={0}
                    step={1}
                    value={newItem.quantity || ''}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="unit_price">Unit Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="unit_price"
                      name="unit_price"
                      type="number"
                      min={0}
                      step={0.01}
                      value={newItem.unit_price || ''}
                      onChange={handleInputChange}
                      className="pl-8"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="impact_days">Schedule Impact (days)</Label>
                  <Input
                    id="impact_days"
                    name="impact_days"
                    type="number"
                    min={0}
                    step={1}
                    value={newItem.impact_days || ''}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={addItem}
                    disabled={
                      loading || !newItem.description || !newItem.quantity || !newItem.unit_price
                    }
                    className="bg-[#0485ea] hover:bg-[#0375d1]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-lg font-medium mb-4">Items List</h3>

            {items.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <p className="text-muted-foreground">No items added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Impact (days)</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.item_type}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.total_price)}
                        </TableCell>
                        <TableCell className="text-right">{item.impact_days}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(item.id)}
                            disabled={loading}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Summary row */}
                    <TableRow className="font-medium">
                      <TableCell colSpan={4} className="text-right">
                        Total:
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(totalAmount)}</TableCell>
                      <TableCell className="text-right">{impactDays}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChangeOrderItems;
