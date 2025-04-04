
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VendorSelector from '@/components/documents/vendor-selector/VendorSelector';

interface ReceiptMetadataFormProps {
  vendor: string;
  expenseType: string;
  amount?: number;
  onVendorChange: (value: string) => void;
  onExpenseTypeChange: (value: string) => void;
  onAmountChange: (value: number | undefined) => void;
  entityType?: string;
  entityId?: string;
}

const EXPENSE_TYPES = [
  { value: 'MATERIALS', label: 'Materials' },
  { value: 'TOOLS', label: 'Tools & Equipment' },
  { value: 'FUEL', label: 'Fuel' },
  { value: 'MEALS', label: 'Meals & Entertainment' },
  { value: 'OTHER', label: 'Other' }
];

const ReceiptMetadataForm: React.FC<ReceiptMetadataFormProps> = ({
  vendor,
  expenseType,
  amount,
  onVendorChange,
  onExpenseTypeChange,
  onAmountChange,
  entityType,
  entityId
}) => {
  return (
    <div className="space-y-4">
      <VendorSelector
        vendorType="vendor"
        value={vendor}
        onChange={onVendorChange}
        label="Vendor"
        entityType={entityType}
        entityId={entityId}
      />
      
      <div className="space-y-2">
        <Label>Expense Type</Label>
        <Select
          value={expenseType}
          onValueChange={onExpenseTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select expense type" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={amount || ''}
          onChange={(e) => onAmountChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        />
      </div>
    </div>
  );
};

export default ReceiptMetadataForm;
