
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { TimeEntry } from '@/types/timeTracking';
import { formatHours } from '@/lib/utils';
import { useVendorOptions } from '@/components/documents/vendor-selector/hooks/useVendorOptions';
import VendorSelector from '@/components/documents/vendor-selector/VendorSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { ExpenseType } from '@/components/documents/schemas/documentSchema';

interface ReceiptUploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntry: Partial<TimeEntry>;
  entityName?: string;
  onSuccess: (documentIds: string[]) => void;
}

// Updated to map UI-friendly labels to valid ExpenseType values
const EXPENSE_TYPES = [
  { value: 'materials', label: 'Materials' },
  { value: 'equipment', label: 'Tools & Equipment' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'other', label: 'Other' }
];

const ReceiptUploadSheet: React.FC<ReceiptUploadSheetProps> = ({
  open,
  onOpenChange,
  timeEntry,
  entityName,
  onSuccess,
}) => {
  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>([]);
  const [vendorId, setVendorId] = useState<string>('');
  const [expenseType, setExpenseType] = useState<string>('materials');
  const [amount, setAmount] = useState<string>('');
  
  // Get vendor options using the hook
  const { vendorOptions, isLoading: loadingVendors } = useVendorOptions();
  
  // Handle successful upload
  const handleUploadSuccess = (documentId?: string) => {
    if (documentId) {
      const newDocIds = [...uploadedDocIds, documentId];
      setUploadedDocIds(newDocIds);
    }
  };
  
  // Handle close with confirmation
  const handleClose = () => {
    if (uploadedDocIds.length > 0) {
      onSuccess(uploadedDocIds);
    }
    onOpenChange(false);
    setUploadedDocIds([]);
    setVendorId('');
    setExpenseType('materials');
    setAmount('');
  };
  
  // Handle amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  // Only render content when open to avoid unnecessary calculations
  if (!open || !timeEntry) return null;
  
  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Upload Receipt</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 mt-4">
          {/* Time Entry Context */}
          <div className="p-3 bg-muted rounded-md space-y-1">
            <p className="text-sm">
              <span className="font-medium">Time Entry:</span> {formatHours(timeEntry.hours_worked)} for {entityName || timeEntry.entity_type}
            </p>
            {timeEntry.notes && (
              <p className="text-sm">
                <span className="font-medium">Notes:</span> {timeEntry.notes}
              </p>
            )}
          </div>
          
          {/* Receipt Details Form */}
          <div className="space-y-4 bg-background p-3 rounded-md border">
            <h3 className="font-medium text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-[#0485ea]" />
              Receipt Details
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input 
                    id="amount" 
                    value={amount} 
                    onChange={handleAmountChange}
                    className="pl-7" 
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expenseType">Expense Type</Label>
                <Select
                  value={expenseType}
                  onValueChange={setExpenseType}
                >
                  <SelectTrigger id="expenseType">
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
                <VendorSelector
                  vendorType="vendor"
                  value={vendorId}
                  onChange={setVendorId}
                  label="Vendor"
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Document Upload Section */}
          <div className="pb-16">
            <EnhancedDocumentUpload
              entityType={timeEntry.entity_type?.toUpperCase() as any}
              entityId={timeEntry.entity_id}
              isReceiptUpload={true}
              prefillData={{
                category: 'receipt',
                tags: ['time-entry', 'mobile-upload'],
                parentEntityType: 'TIME_ENTRY',
                parentEntityId: timeEntry.id,
                amount: amount ? parseFloat(amount) : undefined,
                vendorId: vendorId || undefined,
                expenseType: expenseType // Now we're passing a valid enum value
              }}
              onSuccess={handleUploadSuccess}
              onCancel={handleClose}
            />
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button 
            onClick={handleClose} 
            className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {uploadedDocIds.length > 0 ? 'Done' : 'Skip'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReceiptUploadSheet;
