
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useEntityData } from './hooks/useEntityData';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import { calculateHours } from './utils/timeUtils';
import { QuickLogFormValues } from '@/types/timeTracking';
import TimeRangeSelector from './form/TimeRangeSelector';
import NotesField from './form/NotesField';
import EntitySelector from './form/EntitySelector';
import ReceiptPromptDialog from './dialogs/ReceiptPromptDialog';
import DocumentUploadDirectSheet from './DocumentUploadDirectSheet';
import TimeEntryConfirmationDialog from './dialogs/TimeEntryConfirmationDialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  date: Date;
  defaultEntityType?: 'work_order' | 'project';
  defaultEntityId?: string;
}

const quickLogSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, 'Please select a work order or project'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  hoursWorked: z.number().min(0.01, 'Hours must be greater than 0'),
  notes: z.string().optional(),
});

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  date,
  defaultEntityType = 'work_order',
  defaultEntityId = ''
}) => {
  const { workOrders, projects, isLoadingEntities } = useEntityData();
  const [showReceiptPrompt, setShowReceiptPrompt] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [formData, setFormData] = useState<QuickLogFormValues | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<any>({});
  const [submittedReceipts, setSubmittedReceipts] = useState({ count: 0, totalAmount: 0 });
  const [entityName, setEntityName] = useState('');
  
  const form = useForm<QuickLogFormValues>({
    resolver: zodResolver(quickLogSchema),
    defaultValues: {
      entityType: defaultEntityType,
      entityId: defaultEntityId,
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 8,
      notes: '',
    }
  });
  
  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit();
  
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  const watchEntityType = form.watch('entityType');
  const watchEntityId = form.watch('entityId');
  
  // Update entity name when selection changes
  useEffect(() => {
    if (watchEntityType && watchEntityId) {
      const name = getEntityName();
      setEntityName(name);
    }
  }, [watchEntityType, watchEntityId, workOrders, projects]);
  
  // Update hours when times change
  useEffect(() => {
    if (startTime && endTime) {
      try {
        const totalHours = calculateHours(startTime, endTime);
        form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
      } catch (error) {
        console.error('Error calculating hours:', error);
      }
    }
  }, [startTime, endTime, form]);
  
  const getEntityName = () => {
    if (watchEntityType === 'work_order') {
      return workOrders.find(wo => wo.id === watchEntityId)?.title || '';
    }
    return projects.find(p => p.id === watchEntityId)?.title || '';
  };
  
  const handleSubmit = (data: QuickLogFormValues) => {
    setFormData(data);
    setShowReceiptPrompt(true);
  };
  
  const handleReceiptConfirm = () => {
    setShowReceiptPrompt(false);
    setShowDocumentUpload(true);
  };
  
  const handleReceiptSkip = async () => {
    setShowReceiptPrompt(false);
    if (formData) {
      // Create a time entry object with the workDate set to the provided date
      const timeEntryData = {
        ...formData,
        workDate: date,
        employeeId: undefined,
        hasReceipts: false,
      };
      
      const result = await submitTimeEntry(timeEntryData, [], { category: 'receipt', expenseType: null, tags: ['time-entry'] });
      
      if (result) {
        setSubmittedEntry(result.timeEntry);
        setSubmittedReceipts(result.receipts);
        setShowSuccessDialog(true);
      } else {
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    }
  };
  
  const handleDocumentUploadSuccess = () => {
    setShowDocumentUpload(false);
    setShowSuccessDialog(true);
  };
  
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };
  
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] p-0">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle>Quick Log Time</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(80vh-70px)] px-4 py-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <EntitySelector
                  control={form.control}
                  workOrders={workOrders}
                  projects={projects}
                  isLoading={isLoadingEntities}
                />
                
                <TimeRangeSelector
                  control={form.control}
                  startFieldName="startTime"
                  endFieldName="endTime"
                  hoursFieldName="hoursWorked"
                />
                
                <NotesField control={form.control} />
                
                <div className="pt-4 pb-8">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Log Time"}
                  </Button>
                </div>
              </form>
            </Form>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      
      {/* Receipt Prompt Dialog */}
      <ReceiptPromptDialog
        open={showReceiptPrompt}
        onOpenChange={setShowReceiptPrompt}
        onConfirm={handleReceiptConfirm}
        onCancel={handleReceiptSkip}
      />
      
      {/* Document Upload Sheet for Receipts */}
      {formData && (
        <DocumentUploadDirectSheet
          open={showDocumentUpload}
          onOpenChange={setShowDocumentUpload}
          entityType={formData.entityType === 'work_order' ? 'WORK_ORDER' : 'PROJECT'}
          entityId={formData.entityId}
          onSuccess={handleDocumentUploadSuccess}
          title="Add Receipt"
          isReceiptUploadOnly={true}
          description="Upload your receipt for this time entry"
          showHelpText={false}
          allowEntityTypeSelection={false}
        />
      )}
      
      {/* Success Confirmation Dialog */}
      <TimeEntryConfirmationDialog
        open={showSuccessDialog}
        onOpenChange={handleSuccessDialogClose}
        timeEntry={submittedEntry}
        receipts={submittedReceipts}
        entityName={entityName}
      />
    </>
  );
};

export default MobileQuickLogSheet;
