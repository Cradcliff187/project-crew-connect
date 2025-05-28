import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
// Import necessary components: ReceiptUploader, potentially EntitySelector, EmployeeSelect?

interface AddReceiptSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  // Add other necessary props, e.g., initial date, employeeId?
}

const AddReceiptSheet: React.FC<AddReceiptSheetProps> = ({ open, onOpenChange, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add state for selected files, entity type/id, expense details, etc.

  const handleSaveReceipt = async () => {
    // TODO: Implement logic to:
    // 1. Upload selected file(s)
    // 2. Create 'documents' record
    // 3. Potentially create an 'expenses' record (type != LABOR) linked to the document & entity
    // 4. Call onSuccess
    console.log('Save Receipt logic to be implemented');
    onSuccess(); // Close sheet for now
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Receipt / Expense</SheetTitle>
          <SheetDescription>
            Upload a receipt and associate it with a project or work order.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <p>Receipt Uploader and Form Placeholder</p>
          {/* TODO: Add ReceiptUploader component */}
          {/* TODO: Add EntityTypeSelector / EntitySelector */}
          {/* TODO: Add fields for expense details (amount, vendor, type etc.) */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveReceipt} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Receipt'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddReceiptSheet;
