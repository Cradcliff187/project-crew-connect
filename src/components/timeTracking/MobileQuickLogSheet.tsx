
import React, { useState } from 'react';
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
  // Update to use correct property name
  const { workOrders, projects, isLoadingEntities: loadingEntities } = useEntityData();
  const [showReceiptPrompt, setShowReceiptPrompt] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [formData, setFormData] = useState<QuickLogFormValues | null>(null);
  
  const form = useForm<QuickLogFormValues>({
    resolver: zodResolver(quickLogSchema),
    defaultValues: {
      entityType: defaultEntityType,
      entityId: defaultEntityId,
      startTime: '',
      endTime: '',
      hoursWorked: 0,
      notes: '',
    }
  });
  
  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(() => {
    if (onSuccess) onSuccess();
    onOpenChange(false);
  });
  
  const startTime = form.watch('startTime');
  const endTime = form.watch('endTime');
  
  // Update hours when times change
  React.useEffect(() => {
    if (startTime && endTime) {
      try {
        const totalHours = calculateHours(startTime, endTime);
        form.setValue('hoursWorked', parseFloat(totalHours.toFixed(2)));
      } catch (error) {
        console.error('Error calculating hours:', error);
      }
    }
  }, [startTime, endTime, form]);
  
  const handleSubmit = (data: QuickLogFormValues) => {
    setFormData(data);
    setShowReceiptPrompt(true);
  };
  
  const handleReceiptConfirm = () => {
    setShowReceiptPrompt(false);
    setShowDocumentUpload(true);
  };
  
  const handleReceiptSkip = () => {
    setShowReceiptPrompt(false);
    if (formData) {
      // Create a time entry object with the workDate set to the provided date
      const timeEntryData = {
        ...formData,
        workDate: date,
        employeeId: undefined,
        hasReceipts: false,
      };
      
      submitTimeEntry(timeEntryData, [], { category: 'receipt', expenseType: null, tags: ['time-entry'] });
    }
  };
  
  const handleDocumentUploadSuccess = () => {
    setShowDocumentUpload(false);
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };
  
  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader className="pb-4">
            <SheetTitle>Quick Log Time</SheetTitle>
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <EntitySelector
                control={form.control}
                workOrders={workOrders}
                projects={projects}
                isLoading={loadingEntities}
              />
              
              <TimeRangeSelector
                control={form.control}
                startFieldName="startTime"
                endFieldName="endTime"
                hoursFieldName="hoursWorked"
              />
              
              <NotesField control={form.control} />
              
              <div className="pt-4">
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
    </>
  );
};

export default MobileQuickLogSheet;
