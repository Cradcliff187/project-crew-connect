
import React, { useEffect } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EstimateItem } from '@/components/estimates/types/estimateTypes';

interface EstimateLineItemsEditorProps {
  form: UseFormReturn<any>;
  name: string;
  estimateId: string;
}

const EstimateLineItemsEditor: React.FC<EstimateLineItemsEditorProps> = ({ form, name, estimateId }) => {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: name
  });
  
  // Calculate item total and margin when values change
  const calculateItemValues = (index: number) => {
    const item = fields[index];
    const quantity = parseFloat(form.getValues(`${name}.${index}.quantity`) as string) || 0;
    const unitPrice = parseFloat(form.getValues(`${name}.${index}.unit_price`) as string) || 0;
    const cost = parseFloat(form.getValues(`${name}.${index}.cost`) as string) || 0;
    const markupPercentage = parseFloat(form.getValues(`${name}.${index}.markup_percentage`) as string) || 0;
    
    // Calculate totals
    const totalPrice = quantity * unitPrice;
    const totalCost = quantity * cost;
    const grossMargin = totalPrice - totalCost;
    const grossMarginPercentage = totalPrice > 0 ? (grossMargin / totalPrice) * 100 : 0;
    
    // Update the item
    update(index, {
      ...item,
      total_price: totalPrice,
      gross_margin: grossMargin,
      gross_margin_percentage: grossMarginPercentage
    });
  };

  // Recalculate unit price when cost or markup changes
  const updateUnitPriceFromMarkup = (index: number) => {
    const cost = parseFloat(form.getValues(`${name}.${index}.cost`) as string) || 0;
    const markupPercentage = parseFloat(form.getValues(`${name}.${index}.markup_percentage`) as string) || 0;
    
    // Calculate unit price from cost and markup
    const markupAmount = cost * (markupPercentage / 100);
    const unitPrice = cost + markupAmount;
    
    // Update the unit price field
    form.setValue(`${name}.${index}.unit_price`, unitPrice);
    
    // Then recalculate all values
    calculateItemValues(index);
  };
  
  // Add a new empty item
  const handleAddItem = () => {
    append({
      id: `new-${Date.now()}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      cost: 0,
      markup_percentage: 20, // Default markup
      total_price: 0,
      gross_margin: 0,
      gross_margin_percentage: 0,
      estimate_id: estimateId
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Line Items</h3>
        <Button 
          type="button" 
          onClick={handleAddItem}
          variant="outline"
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Markup %</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <Textarea
                        {...form.register(`${name}.${index}.description`)}
                        rows={2}
                        className="resize-none"
                        placeholder="Item description"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      {...form.register(`${name}.${index}.quantity`)}
                      type="number"
                      min="1"
                      step="1"
                      className="text-right"
                      onChange={() => calculateItemValues(index)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      {...form.register(`${name}.${index}.cost`)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="text-right"
                      onChange={() => updateUnitPriceFromMarkup(index)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      {...form.register(`${name}.${index}.markup_percentage`)}
                      type="number"
                      min="0"
                      step="0.1"
                      className="text-right"
                      onChange={() => updateUnitPriceFromMarkup(index)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      {...form.register(`${name}.${index}.unit_price`)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="text-right"
                      onChange={() => calculateItemValues(index)}
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency((field as EstimateItem).total_price || 0)}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No items
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddItem}
                    >
                      Add your first item
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {fields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-50 p-3 border rounded-md">
            <h4 className="text-sm font-medium text-[#0485ea] mb-2">Financial Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
                <div className="text-sm font-medium">
                  {formatCurrency(
                    fields.reduce((sum, item: any) => sum + ((parseFloat(form.getValues(`${name}.${fields.indexOf(item)}.cost`)) || 0) * (parseFloat(form.getValues(`${name}.${fields.indexOf(item)}.quantity`)) || 0)), 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
                <div className="text-sm font-medium">
                  {formatCurrency(
                    fields.reduce((sum, item: any) => sum + (item.total_price || 0), 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gross Margin</div>
                <div className="text-sm font-medium">
                  {formatCurrency(
                    fields.reduce((sum, item: any) => sum + (item.total_price || 0), 0) - 
                    fields.reduce((sum, item: any) => sum + ((parseFloat(form.getValues(`${name}.${fields.indexOf(item)}.cost`)) || 0) * (parseFloat(form.getValues(`${name}.${fields.indexOf(item)}.quantity`)) || 0)), 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateLineItemsEditor;
