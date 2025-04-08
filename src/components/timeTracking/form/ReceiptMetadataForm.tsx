
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ReceiptMetadata } from '@/types/timeTracking';

interface ReceiptMetadataFormProps {
  vendor: string;
  expenseType: string;
  amount?: number;
  onVendorChange: (value: string) => void;
  onExpenseTypeChange: (value: string) => void;
  onAmountChange: (value?: number) => void;
  entityType?: string;
  entityId?: string;
  metadata: ReceiptMetadata;
  updateMetadata: (data: Partial<ReceiptMetadata>) => void;
  expenseDate?: Date;
  onExpenseDateChange?: (date: Date) => void;
}

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
  updateMetadata,
  expenseDate = new Date(),
  onExpenseDateChange
}) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<{id: string, name: string}[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  
  // Load vendors and expense types on component mount
  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoadingVendors(true);
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('vendor_id, name')
          .order('name');
          
        if (error) throw error;
        setVendors(data || []);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setIsLoadingVendors(false);
      }
    };
    
    const fetchExpenseTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('expense_types')
          .select('id, name')
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        setExpenseTypes(data || []);
      } catch (error) {
        console.error('Error fetching expense types:', error);
      }
    };
    
    fetchVendors();
    fetchExpenseTypes();
  }, []);
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onAmountChange(undefined);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onAmountChange(numValue);
      }
    }
  };
  
  const handleExpenseDateChange = (date: Date | undefined) => {
    if (date && onExpenseDateChange) {
      onExpenseDateChange(date);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor</Label>
          <Select
            value={vendor}
            onValueChange={onVendorChange}
            disabled={isLoadingVendors}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select a vendor</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.vendor_id} value={v.vendor_id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expenseType">Expense Type</Label>
          <Select
            value={expenseType}
            onValueChange={onExpenseTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select expense type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select type</SelectItem>
              {expenseTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount !== undefined ? amount : ''}
            onChange={handleAmountChange}
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="expenseDate">Receipt Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !expenseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {expenseDate ? format(expenseDate, 'PPP') : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expenseDate}
                onSelect={handleExpenseDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default ReceiptMetadataForm;
