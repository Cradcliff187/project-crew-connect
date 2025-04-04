
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, XCircle } from 'lucide-react';
import VendorSelector from '@/components/documents/vendor-selector/VendorSelector';
import { supabase } from '@/integrations/supabase/client';

// Expense types for categorization
const expenseTypes = [
  { value: 'materials', label: 'Materials' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'fuel', label: 'Fuel/Gas' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'meals', label: 'Meals & Entertainment' },
  { value: 'accommodations', label: 'Accommodations' },
  { value: 'permits', label: 'Permits & Fees' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'other', label: 'Other' }
];

// Predefined tags based on context
const suggestedTags = [
  'time-entry', 
  'receipt', 
  'expense', 
  'reimbursement',
  'fuel',
  'materials',
  'tools',
  'supplies'
];

interface ReceiptMetadataFormProps {
  metadata: {
    category: string;
    expenseType: string | null;
    tags: string[];
    vendorId?: string;
    vendorType?: 'vendor' | 'subcontractor' | 'other';
    amount?: number;
  };
  updateMetadata: (data: Partial<{
    category: string;
    expenseType: string | null;
    tags: string[];
    vendorId?: string;
    vendorType?: 'vendor' | 'subcontractor' | 'other';
    amount?: number;
  }>) => void;
  entityType: 'work_order' | 'project';
  entityId?: string;
}

const ReceiptMetadataForm: React.FC<ReceiptMetadataFormProps> = ({
  metadata,
  updateMetadata,
  entityType,
  entityId
}) => {
  const [newTag, setNewTag] = useState('');
  const [knownVendors, setKnownVendors] = useState<boolean>(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>(metadata.amount?.toString() || '');

  // Check if entity has known vendors
  useEffect(() => {
    if (entityId) {
      const checkVendors = async () => {
        setIsLoadingVendors(true);
        try {
          const { data: vendorAssociations, error } = await supabase
            .from('vendor_associations')
            .select('vendor_id')
            .eq('entity_type', entityType.toUpperCase())
            .eq('entity_id', entityId)
            .limit(1);
            
          setKnownVendors(vendorAssociations && vendorAssociations.length > 0);
        } catch (error) {
          console.error('Error checking vendors:', error);
        } finally {
          setIsLoadingVendors(false);
        }
      };
      
      checkVendors();
    }
  }, [entityId, entityType]);

  const handleExpenseTypeChange = (value: string) => {
    updateMetadata({ expenseType: value });
    
    // Optionally add the expense type as a tag if it's not already there
    if (!metadata.tags.includes(value)) {
      updateMetadata({ 
        tags: [...metadata.tags, value] 
      });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Only update if it's a valid number
    if (!isNaN(parseFloat(value))) {
      updateMetadata({ amount: parseFloat(value) });
    }
  };

  const handleVendorTypeChange = (value: 'vendor' | 'subcontractor' | 'other') => {
    updateMetadata({ 
      vendorType: value,
      // Clear vendorId when changing type
      vendorId: undefined 
    });
  };

  const handleVendorSelect = (vendorId: string) => {
    updateMetadata({ vendorId });
  };

  const addTag = (tag: string) => {
    if (tag && !metadata.tags.includes(tag)) {
      updateMetadata({ 
        tags: [...metadata.tags, tag] 
      });
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    updateMetadata({
      tags: metadata.tags.filter(t => t !== tag)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag) {
      e.preventDefault();
      addTag(newTag);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Receipt Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="expense-type">Expense Type</Label>
          <Select
            value={metadata.expenseType || ''}
            onValueChange={handleExpenseTypeChange}
          >
            <SelectTrigger id="expense-type">
              <SelectValue placeholder="Select expense type" />
            </SelectTrigger>
            <SelectContent>
              {expenseTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Categorize what type of expense this receipt represents
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor-type">Vendor Type</Label>
          <Select
            value={metadata.vendorType || 'vendor'}
            onValueChange={handleVendorTypeChange}
          >
            <SelectTrigger id="vendor-type">
              <SelectValue placeholder="Select vendor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="subcontractor">Subcontractor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {metadata.vendorType && (
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <VendorSelector
              vendorType={metadata.vendorType}
              value={metadata.vendorId || ''}
              onChange={handleVendorSelect}
              entityType={entityType.toUpperCase()}
              entityId={entityId}
              showAddNew
            />
            {knownVendors && (
              <p className="text-xs text-muted-foreground">
                This {entityType} has existing vendors associated with it
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5">$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              className="pl-7"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex flex-wrap gap-1 mb-2">
            {metadata.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1">
                {tag}
                <XCircle 
                  className="h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => addTag(newTag)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {suggestedTags
              .filter(tag => !metadata.tags.includes(tag))
              .map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Add tags to help organize and search for this receipt later
          </p>
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          This receipt will be linked to this time entry and the selected {entityType.replace('_', ' ')}.
        </div>
      </CardContent>
    </Card>
  );
};

export default ReceiptMetadataForm;
