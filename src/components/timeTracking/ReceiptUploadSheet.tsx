
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { TimeEntry } from '@/types/timeTracking';
import { formatHours } from '@/lib/utils';

interface ReceiptUploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeEntry: Partial<TimeEntry>;
  entityName?: string;
  onSuccess: (documentIds: string[]) => void;
}

const ReceiptUploadSheet: React.FC<ReceiptUploadSheetProps> = ({
  open,
  onOpenChange,
  timeEntry,
  entityName,
  onSuccess,
}) => {
  const [uploadedDocIds, setUploadedDocIds] = useState<string[]>([]);
  
  // Handle successful upload
  const handleUploadSuccess = (documentId?: string) => {
    if (documentId) {
      const newDocIds = [...uploadedDocIds, documentId];
      setUploadedDocIds(newDocIds);
      
      // If this is the expected final upload, call onSuccess
      if (!open) {
        onSuccess(newDocIds);
      }
    }
  };
  
  // Handle close with confirmation
  const handleClose = () => {
    if (uploadedDocIds.length > 0) {
      onSuccess(uploadedDocIds);
    }
    onOpenChange(false);
    setUploadedDocIds([]);
  };
  
  // Only render content when open to avoid unnecessary calculations
  if (!open || !timeEntry) return null;
  
  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Upload Receipt</SheetTitle>
        </SheetHeader>
        
        <div className="mb-4 mt-2 p-3 bg-muted rounded-md">
          <p className="text-sm mb-2">
            <span className="font-medium">Time Entry:</span> {formatHours(timeEntry.hours_worked)} for {entityName || timeEntry.entity_type}
          </p>
          {timeEntry.notes && (
            <p className="text-sm">
              <span className="font-medium">Notes:</span> {timeEntry.notes}
            </p>
          )}
        </div>
        
        <div className="pb-16">
          <EnhancedDocumentUpload
            entityType={timeEntry.entity_type?.toUpperCase() as any}
            entityId={timeEntry.entity_id}
            isReceiptUpload={true}
            prefillData={{
              category: 'receipt',
              tags: ['time-entry', 'mobile-upload'],
              parentEntityType: 'TIME_ENTRY',
              parentEntityId: timeEntry.id
            }}
            onSuccess={handleUploadSuccess}
            onCancel={handleClose}
          />
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
