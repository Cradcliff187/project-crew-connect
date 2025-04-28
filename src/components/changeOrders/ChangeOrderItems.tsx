import { useState, useEffect } from 'react';
import { UseFormReturn, useFieldArray, Controller } from 'react-hook-form';
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
  TableFooter,
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

// Define types for fetched data
type Vendor = { vendorid: string; vendorname: string };
type Subcontractor = { subid: string; subname: string };

interface ChangeOrderItemsProps {
  form: UseFormReturn<ChangeOrder>;
}

const ChangeOrderItems = ({ form }: ChangeOrderItemsProps) => {
  const { fields, append, remove } = useFieldArray<ChangeOrder>({
    control: form.control,
    name: 'items',
  });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingSubcontractors, setLoadingSubcontractors] = useState(false);

  const itemTypes = [
    { value: 'LABOR', label: 'Labor' },
    { value: 'MATERIAL', label: 'Material' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SUBCONTRACTOR', label: 'Subcontractor' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    fetchVendors();
    fetchSubcontractors();
  }, []);

  const currentItems = form.watch('items') || [];
  const totalAmount = currentItems.reduce((sum, item) => sum + (item?.total_price || 0), 0);

  const fetchVendors = async () => {
    if (vendors.length > 0) return;
    setLoadingVendors(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname')
        .order('vendorname');
      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      toast({ title: 'Error loading vendors', description: error.message, variant: 'destructive' });
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchSubcontractors = async () => {
    if (subcontractors.length > 0) return;
    setLoadingSubcontractors(true);
    try {
      const { data, error } = await supabase
        .from('subcontractors')
        .select('subid, subname')
        .order('subname');
      if (error) throw error;
      setSubcontractors(data || []);
    } catch (error: any) {
      console.error('Error fetching subcontractors:', error);
      toast({
        title: 'Error loading subcontractors',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoadingSubcontractors(false);
    }
  };

  const addNewItemRow = () => {
    append({
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      cost: 0,
      markup_percentage: 0,
      markup_amount: 0,
      gross_margin: 0,
      gross_margin_percentage: 0,
      item_type: 'LABOR',
      vendor_id: null,
      subcontractor_id: null,
      custom_type: null,
      document_id: null,
      expense_type: null,
      trade_type: null,
      change_order_id: '',
    } as ChangeOrderItem);
  };

  const removeItemRow = (index: number) => {
    remove(index);
  };

  const handleItemValueChange = (index: number, field: keyof ChangeOrderItem, value: any) => {
    const currentItem = form.getValues(`items.${index}`);
    let updatedValue = value;
    let quantity = currentItem.quantity || 0;
    let cost = currentItem.cost || 0;
    let markup_percentage = currentItem.markup_percentage || 0;

    if (field === 'quantity' || field === 'cost' || field === 'markup_percentage') {
      updatedValue = Math.max(0, parseFloat(value) || 0);
      if (field === 'quantity') quantity = updatedValue;
      if (field === 'cost') cost = updatedValue;
      if (field === 'markup_percentage') markup_percentage = updatedValue;
    }

    form.setValue(`items.${index}.${field}`, updatedValue);

    const markup_amount = cost * (markup_percentage / 100);
    const unit_price = cost + markup_amount;
    const total_price = quantity * unit_price;
    const total_cost = quantity * cost;
    const gross_margin = total_price - total_cost;
    const gross_margin_percentage = total_price > 0 ? (gross_margin / total_price) * 100 : 0;

    form.setValue(`items.${index}.markup_amount`, parseFloat(markup_amount.toFixed(2)));
    form.setValue(`items.${index}.unit_price`, parseFloat(unit_price.toFixed(2)));
    form.setValue(`items.${index}.total_price`, parseFloat(total_price.toFixed(2)));
    form.setValue(`items.${index}.gross_margin`, parseFloat(gross_margin.toFixed(2)));
    form.setValue(
      `items.${index}.gross_margin_percentage`,
      parseFloat(gross_margin_percentage.toFixed(2))
    );

    form.trigger(`items.${index}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {fields.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">No items added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor/Sub</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Markup %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const itemType = form.watch(`items.${index}.item_type`);
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Item description"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name={`items.${index}.item_type`}
                          control={form.control}
                          render={({ field: controllerField }) => (
                            <Select
                              value={controllerField.value || ''}
                              onValueChange={value =>
                                handleItemValueChange(index, 'item_type', value)
                              }
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Type" />
                              </SelectTrigger>
                              <SelectContent>
                                {itemTypes.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {itemType === 'MATERIAL' && (
                          <Controller
                            name={`items.${index}.vendor_id`}
                            control={form.control}
                            render={({ field: controllerField }) => (
                              <Select
                                value={controllerField.value || 'none'}
                                onValueChange={value =>
                                  handleItemValueChange(
                                    index,
                                    'vendor_id',
                                    value === 'none' ? null : value
                                  )
                                }
                                disabled={loadingVendors}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue
                                    placeholder={loadingVendors ? 'Loading...' : 'Vendor'}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {vendors.map(v => (
                                    <SelectItem key={v.vendorid} value={v.vendorid}>
                                      {v.vendorname}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        )}
                        {itemType === 'SUBCONTRACTOR' && (
                          <Controller
                            name={`items.${index}.subcontractor_id`}
                            control={form.control}
                            render={({ field: controllerField }) => (
                              <Select
                                value={controllerField.value || 'none'}
                                onValueChange={value =>
                                  handleItemValueChange(
                                    index,
                                    'subcontractor_id',
                                    value === 'none' ? null : value
                                  )
                                }
                                disabled={loadingSubcontractors}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue
                                    placeholder={loadingSubcontractors ? 'Loading...' : 'Sub'}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {subcontractors.map(s => (
                                    <SelectItem key={s.subid} value={s.subid}>
                                      {s.subname}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        )}
                        {itemType !== 'MATERIAL' && itemType !== 'SUBCONTRACTOR' && <span>-</span>}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          {...form.register(`items.${index}.quantity`, {
                            setValueAs: v => parseInt(v) || 1,
                          })}
                          onChange={e => handleItemValueChange(index, 'quantity', e.target.value)}
                          className="h-8 w-16 text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <DollarSign className="absolute left-1 top-2 h-3 w-3 text-muted-foreground" />
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            {...form.register(`items.${index}.cost`, {
                              setValueAs: v => (v === '' ? null : parseFloat(v)),
                            })}
                            onChange={e => handleItemValueChange(index, 'cost', e.target.value)}
                            className="h-8 w-24 pl-5 text-right"
                            placeholder="0.00"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            step={0.1}
                            {...form.register(`items.${index}.markup_percentage`, {
                              setValueAs: v => (v === '' ? null : parseFloat(v)),
                            })}
                            onChange={e =>
                              handleItemValueChange(index, 'markup_percentage', e.target.value)
                            }
                            className="h-8 w-20 pr-5 text-right"
                            placeholder="0.0"
                          />
                          <span className="absolute right-2 top-2 h-4 w-4 text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(form.watch(`items.${index}.total_price`) || 0)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {`${(form.watch(`items.${index}.gross_margin_percentage`) || 0).toFixed(1)}%`}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItemRow(index)}
                          className="h-8 w-8"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-semibold">
                    Total Amount:
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totalAmount)}
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewItemRow}
            className="mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeOrderItems;
