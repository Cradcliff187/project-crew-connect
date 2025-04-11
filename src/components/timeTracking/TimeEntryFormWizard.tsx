
import React, { useState } from 'react';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import EntitySelector from './form/EntitySelector';
import DateSelect from './form/DateSelect';
import TimeRangeSelector from './form/TimeRangeSelector';
import NotesField from './form/NotesField';
import EmployeeSelect from './form/EmployeeSelect';
import ReceiptUploader from './form/ReceiptUploader';
import ReceiptMetadataForm from './form/ReceiptMetadataForm';
import ConfirmationDialog from './form/ConfirmationDialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEntityData } from './hooks/useEntityData';
import { Card, CardContent } from '@/components/ui/card';
import ReceiptPromptDialog from './dialogs/ReceiptPromptDialog';
import TimeEntryConfirmationDialog from './dialogs/TimeEntryConfirmationDialog';
import { TimeEntry } from '@/types/timeTracking';

interface TimeEntryFormWizardProps {
  onSuccess: () => void;
  date?: Date;
  defaultEntityType?: 'work_order' | 'project';
  defaultEntityId?: string;
}

const TimeEntryFormWizard: React.FC<TimeEntryFormWizardProps> = ({
  onSuccess,
  date,
  defaultEntityType,
  defaultEntityId
}) => {
  const [showReceiptPrompt, setShowReceiptPrompt] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<Partial<TimeEntry>>({});
  const [submittedReceipts, setSubmittedReceipts] = useState({ count: 0, totalAmount: 0 });
  const [entityName, setEntityName] = useState('');
  
  const {
    form,
    isLoading,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateReceiptMetadata,
    handleSubmit
  } = useTimeEntryForm(() => {
    // Don't call onSuccess directly - we'll call it when dialog is closed
  });
  
  const { workOrders, projects, employees, isLoadingEntities } = useEntityData();
  
  const watchEntityType = form.watch('entityType');
  const watchEntityId = form.watch('entityId');
  const watchHasReceipts = form.watch('hasReceipts');
  
  React.useEffect(() => {
    if (date) {
      form.setValue('workDate', date);
    }
    
    if (defaultEntityType) {
      form.setValue('entityType', defaultEntityType);
    }
    
    if (defaultEntityId) {
      form.setValue('entityId', defaultEntityId);
    }
    
    // Set default value for employeeId to "none" instead of empty string
    if (!form.getValues('employeeId')) {
      form.setValue('employeeId', 'none');
    }
  }, [form, date, defaultEntityType, defaultEntityId]);
  
  // Update entity name when selection changes
  React.useEffect(() => {
    if (watchEntityType && watchEntityId) {
      const name = getEntityName();
      setEntityName(name);
    }
  }, [watchEntityType, watchEntityId, workOrders, projects]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = form.trigger();
    isValid.then((valid) => {
      if (valid) {
        if (!watchHasReceipts && !showReceiptPrompt) {
          setShowReceiptPrompt(true);
        } else {
          setShowConfirmation(true);
        }
      }
    });
  };
  
  const handleReceiptPromptConfirm = () => {
    setShowReceiptPrompt(false);
    form.setValue('hasReceipts', true);
    setShowReceiptUpload(true);
  };
  
  const handleReceiptPromptCancel = () => {
    setShowReceiptPrompt(false);
    setShowConfirmation(true);
  };
  
  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    const data = form.getValues();
    
    // Convert employeeId "none" to null before submitting
    if (data.employeeId === 'none') {
      data.employeeId = undefined;
    }
    
    const result = await handleSubmit(data);
    if (result) {
      setSubmittedEntry(result.timeEntry);
      setSubmittedReceipts(result.receipts);
      setShowSuccessDialog(true);
    }
  };
  
  const getEntityName = () => {
    if (watchEntityType === 'work_order') {
      return workOrders.find(wo => wo.id === watchEntityId)?.title || '';
    }
    return projects.find(p => p.id === watchEntityId)?.title || '';
  };
  
  // Handle closing the receipt upload form and proceeding to confirmation
  const handleReceiptUploadComplete = () => {
    setShowReceiptUpload(false);
    setShowConfirmation(true);
  };
  
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    onSuccess();
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <EntitySelector 
            control={form.control}
            workOrders={workOrders}
            projects={projects}
            isLoading={isLoadingEntities}
          />
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DateSelect control={form.control} />
            <TimeRangeSelector 
              control={form.control}
              startFieldName="startTime"
              endFieldName="endTime"
              hoursFieldName="hoursWorked"
            />
          </div>
          
          <EmployeeSelect 
            control={form.control}
            employees={employees}
          />
          
          <NotesField control={form.control} />
          
          {watchHasReceipts && showReceiptUpload && (
            <Card>
              <CardContent className="pt-4">
                <ReceiptUploader
                  selectedFiles={selectedFiles}
                  onFilesSelected={handleFilesSelected}
                  onFileClear={handleFileClear}
                />
                
                {selectedFiles.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <ReceiptMetadataForm
                      vendor={receiptMetadata.vendorId || "none"}
                      expenseType={receiptMetadata.expenseType || ""}
                      amount={receiptMetadata.amount}
                      onVendorChange={(value) => updateReceiptMetadata({ vendorId: value })}
                      onExpenseTypeChange={(value) => updateReceiptMetadata({ expenseType: value })}
                      onAmountChange={(value) => updateReceiptMetadata({ amount: value })}
                      entityType={watchEntityType}
                      entityId={watchEntityId}
                      metadata={receiptMetadata}
                      updateMetadata={updateReceiptMetadata}
                    />
                    <div className="mt-4 flex justify-end">
                      <Button 
                        type="button" 
                        onClick={handleReceiptUploadComplete}
                        className="bg-[#0485ea] hover:bg-[#0375d1]"
                      >
                        Continue
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Time Entry"}
            </Button>
          </div>
        </form>
      </Form>
      
      <ReceiptPromptDialog
        open={showReceiptPrompt}
        onOpenChange={setShowReceiptPrompt}
        onConfirm={handleReceiptPromptConfirm}
        onCancel={handleReceiptPromptCancel}
      />
      
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        confirmationData={form.getValues()}
        employees={employees}
        entityType={watchEntityType}
        workOrders={workOrders}
        projects={projects}
        selectedFiles={selectedFiles}
        isLoading={isLoading}
        onConfirm={handleConfirmSubmit}
      />
      
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

export default TimeEntryFormWizard;
