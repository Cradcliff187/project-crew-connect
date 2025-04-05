
import React from 'react';
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
  
  // Calculate item total when quantity or price changes
  const calculateItemTotal = (index: number) => {
    const item = fields[index];
    const quantity = parseFloat(form.getValues(`${name}.${index}.quantity`) as string) || 0;
    const unitPrice = parseFloat(form.getValues(`${name}.${index}.unit_price`) as string) || 0;
    const total = quantity * unitPrice;
    
    update(index, {
      ...item,
      total_price: total
    });
  };
  
  // Add a new empty item
  const handleAddItem = () => {
    append({
      id: `new-${Date.now()}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
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
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[15%] text-right">Quantity</TableHead>
              <TableHead className="w-[15%] text-right">Unit Price</TableHead>
              <TableHead className="w-[15%] text-right">Total</TableHead>
              <TableHead className="w-[15%]"></TableHead>
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
                      onChange={() => calculateItemTotal(index)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      {...form.register(`${name}.${index}.unit_price`)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="text-right"
                      onChange={() => calculateItemTotal(index)}
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
                <TableCell colSpan={5} className="h-24 text-center">
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
    </div>
  );
};

export default EstimateLineItemsEditor;
