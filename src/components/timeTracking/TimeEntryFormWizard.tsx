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
import { Dialog } from '@/components/ui/dialog';
import ReceiptPromptDialog from './dialogs/ReceiptPromptDialog';

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
  
  const {
    form,
    isLoading,
    selectedFiles,
    receiptMetadata,
    handleFilesSelected,
    handleFileClear,
    updateReceiptMetadata,
    handleSubmit
  } = useTimeEntryForm(onSuccess);
  
  const { workOrders, projects, employees, isLoadingEntities: loadingEntities } = useEntityData();
  
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
  }, [form, date, defaultEntityType, defaultEntityId]);
  
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
    setShowConfirmation(true);
  };
  
  const handleReceiptPromptCancel = () => {
    setShowReceiptPrompt(false);
    setShowConfirmation(true);
  };
  
  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    const data = form.getValues();
    handleSubmit(data);
  };
  
  const getEntityName = () => {
    if (watchEntityType === 'work_order') {
      return workOrders.find(wo => wo.id === watchEntityId)?.name || '';
    }
    return projects.find(p => p.id === watchEntityId)?.name || '';
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <EntitySelector 
            control={form.control}
            workOrders={workOrders}
            projects={projects}
            isLoading={loadingEntities}
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
          
          {watchHasReceipts && (
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
                      vendor={receiptMetadata.vendorId || ""}
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
    </>
  );
};

export default TimeEntryFormWizard;
