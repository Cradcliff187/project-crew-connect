
import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstimateItem } from './types/estimateTypes';
import { useToast } from "@/hooks/use-toast";
import { Document } from '@/components/documents/schemas/documentSchema';

export interface EstimateItemsProps {
  items: EstimateItem[];
  onChange: (newItems: EstimateItem[]) => void;
  itemDocuments?: Record<string, Document[]>;
  estimateId?: string;
  onDocumentAdded?: () => void;
}

const EstimateItems: React.FC<EstimateItemsProps> = ({ 
  items, 
  onChange,
  itemDocuments = {},
  estimateId,
  onDocumentAdded
}) => {
  const { toast } = useToast();
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EstimateItem | null>(null);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    // Ensure quantity and unit_price are parsed as numbers
    if (field === 'quantity' || field === 'unit_price') {
      const parsedValue = parseFloat(value);
      newItems[index][field] = isNaN(parsedValue) ? 0 : parsedValue;
    } else {
      newItems[index][field] = value;
    }
    onChange(newItems);
  };

  const handleAddItem = () => {
    const newItem: EstimateItem = {
      id: Math.random().toString(36).substring(2, 9), // Generate a simple unique ID
      estimate_id: estimateId || '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      item_type: 'labor',
      cost: 0,
      markup_percentage: 0,
    };
    onChange([...items, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    onChange(newItems);
  };

  const onUploadDocument = (item: EstimateItem) => {
    setSelectedItem(item);
    setShowDocumentUpload(true);
  };

  const closeDocumentUpload = () => {
    setShowDocumentUpload(false);
    setSelectedItem(null);
  };

  const handleDocumentUploaded = (documentId: string) => {
    if (!selectedItem) return;

    // Update the item with the document_id
    const updatedItems = items.map(item =>
      item.id === selectedItem.id ? { ...item, document_id: documentId } : item
    );
    onChange(updatedItems);

    toast({
      title: "Document Attached",
      description: "The document has been successfully attached to the item.",
    });
    closeDocumentUpload();
    
    if (onDocumentAdded) {
      onDocumentAdded();
    }
  };

  return (
    <div>
      <h4 className="text-md font-bold mb-2">Estimate Items</h4>
      {items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-12 gap-4 mb-4">
          {/* Description */}
          <div className="col-span-5">
            <Label htmlFor={`description-${item.id}`}>Description</Label>
            <Input
              type="text"
              id={`description-${item.id}`}
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            />
          </div>

          {/* Item Type */}
          <div className="col-span-2">
            <Label htmlFor={`item_type-${item.id}`}>Item Type</Label>
            <Select
              value={item.item_type || 'labor'}
              onValueChange={(value) => handleItemChange(index, 'item_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="labor">Labor</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost */}
          <div className="col-span-2">
            <Label htmlFor={`cost-${item.id}`}>Cost</Label>
            <Input
              type="number"
              id={`cost-${item.id}`}
              value={item.cost}
              onChange={(e) => handleItemChange(index, 'cost', e.target.value)}
            />
          </div>

          {/* Markup Percentage */}
           <div className="col-span-2">
            <Label htmlFor={`markup_percentage-${item.id}`}>Markup (%)</Label>
            <Input
              type="number"
              id={`markup_percentage-${item.id}`}
              value={item.markup_percentage}
              onChange={(e) => handleItemChange(index, 'markup_percentage', e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div className="col-span-1">
            <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
            <Input
              type="number"
              id={`quantity-${item.id}`}
              value={String(item.quantity)}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="col-span-1 flex items-end justify-between">
            <Button variant="outline" size="icon" onClick={() => onUploadDocument(item)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip">
                <path d="M10 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>
                <path d="M12 12a4 4 0 0 0-4-4H4v6l4-4 4 4v-2"/>
              </svg>
            </Button>
            <Button variant="destructive" size="icon" onClick={() => handleDeleteItem(item.id)}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Button onClick={handleAddItem}>Add Item</Button>

      {showDocumentUpload && selectedItem && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
            {/* We'll use a simpler approach here */}
            <div className="space-y-4">
              <Button onClick={closeDocumentUpload} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateItems;
