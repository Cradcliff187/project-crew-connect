
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VendorSelector from '@/components/documents/vendor-selector/VendorSelector';
import { ReceiptMetadata } from '@/types/timeTracking';

export interface ReceiptMetadataFormProps {
  vendor: string;
  expenseType: string;
  amount?: number;
  onVendorChange: (value: string) => void;
  onExpenseTypeChange: (value: string) => void;
  onAmountChange: (value: number | undefined) => void;
  entityType?: string;
  entityId?: string;
  metadata?: ReceiptMetadata;
  updateMetadata?: (data: Partial<ReceiptMetadata>) => void;
}

// Updated expense types to match what's used elsewhere in the application
const EXPENSE_TYPES = [
  { value: 'MATERIALS', label: 'Materials' },
  { value: 'TOOLS', label: 'Tools & Equipment' },
  { value: 'SUPPLIES', label: 'Supplies' },
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
  entityId,
  metadata,
  updateMetadata
}) => {
  // If metadata and updateMetadata are provided, use those instead
  const handleVendorChange = (value: string) => {
    if (metadata && updateMetadata) {
      updateMetadata({ vendorId: value });
    } else {
      onVendorChange(value);
    }
  };
  
  const handleExpenseTypeChange = (value: string) => {
    if (metadata && updateMetadata) {
      updateMetadata({ expenseType: value });
    } else {
      onExpenseTypeChange(value);
    }
  };
  
  const handleAmountChange = (value: number | undefined) => {
    if (metadata && updateMetadata) {
      updateMetadata({ amount: value });
    } else {
      onAmountChange(value);
    }
  };
  
  // Determine the actual values to use
  const actualVendor = metadata?.vendorId || vendor;
  const actualExpenseType = metadata?.expenseType || expenseType || 'MATERIALS';
  const actualAmount = metadata?.amount || amount;
  
  return (
    <div className="space-y-4">
      <VendorSelector
        vendorType="vendor"
        value={actualVendor}
        onChange={handleVendorChange}
        label="Vendor"
        entityType={entityType}
        entityId={entityId}
      />
      
      <div className="space-y-2">
        <Label>Expense Type</Label>
        <Select
          value={actualExpenseType}
          onValueChange={handleExpenseTypeChange}
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
          value={actualAmount || ''}
          onChange={(e) => handleAmountChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        />
      </div>
    </div>
  );
};

export default ReceiptMetadataForm;
