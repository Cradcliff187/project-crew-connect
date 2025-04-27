import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { EXPENSE_TYPES } from '@/constants/expenseTypes';

// Filter out expense types that should not be manually added (e.g., Labor)
const MANUAL_EXPENSE_CATEGORIES = EXPENSE_TYPES.filter(
  type => type.value !== 'labor' // Exclude 'labor'
  // Add other exclusions like 'subcontractor' if needed:
  // && type.value !== 'subcontractor'
);

interface ExpenseFormFieldsProps {
  expenseName: string;
  setExpenseName: (value: string) => void;
  quantity: string;
  setQuantity: (value: string) => void;
  unitPrice: string;
  setUnitPrice: (value: string) => void;
  selectedVendor: string | null;
  setSelectedVendor: (value: string | null) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  vendors: { vendorid: string; vendorname: string }[];
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
  selectedCategory,
  setSelectedCategory,
  vendors,
  onAddVendorClick,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="expense-name">Expense Name</Label>
        <Input
          id="expense-name"
          value={expenseName}
          onChange={e => setExpenseName(e.target.value)}
          placeholder="Enter expense name"
        />
      </div>

      <div>
        <Label htmlFor="expense-category">Expense Category</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
          <SelectTrigger id="expense-category">
            <SelectValue placeholder="Choose expense category" />
          </SelectTrigger>
          <SelectContent>
            {MANUAL_EXPENSE_CATEGORIES.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="1"
            placeholder="1"
          />
        </div>

        <div>
          <Label htmlFor="unit-price">Unit Price ($)</Label>
          <Input
            id="unit-price"
            value={unitPrice}
            onChange={e => setUnitPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vendor">Vendor</Label>
        <Select
          value={selectedVendor || ''}
          onValueChange={value => {
            if (value === 'add-new-vendor') {
              onAddVendorClick();
            } else {
              setSelectedVendor(value);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="add-new-vendor" className="font-medium text-[#0485ea]">
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Vendor
              </div>
            </SelectItem>
            {vendors.map(vendor => (
              <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                {vendor.vendorname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExpenseFormFields;
