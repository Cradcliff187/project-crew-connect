
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ExpenseFormFieldsProps {
  expenseName: string;
  setExpenseName: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  unitPrice: string;
  setUnitPrice: (value: string) => void;
  selectedVendor: string | null;
  setSelectedVendor: (value: string | null) => void;
  vendors: { vendorid: string, vendorname: string }[];
  onAddVendorClick: () => void;
}

const ExpenseFormFields: React.FC<ExpenseFormFieldsProps> = ({
  expenseName,
  setExpenseName,
  quantity,
  setQuantity,
  unitPrice,
  setUnitPrice,
  selectedVendor,
  setSelectedVendor,
  vendors,
  onAddVendorClick
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="expense-name">Expense Name</Label>
        <Input
          id="expense-name"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          placeholder="Enter expense name"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            placeholder="1"
          />
        </div>
        
        <div>
          <Label htmlFor="unit-price">Unit Price ($)</Label>
          <Input
            id="unit-price"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="vendor">Vendor (Optional)</Label>
        <div className="flex gap-2">
          <Select
            value={selectedVendor || ""}
            onValueChange={(value) => setSelectedVendor(value || null)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                  {vendor.vendorname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddVendorClick}
            title="Add New Vendor"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormFields;
