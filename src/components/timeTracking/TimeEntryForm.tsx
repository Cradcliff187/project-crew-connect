
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

import ConfirmationDialog from './form/ConfirmationDialog';
import { useTimeEntryForm } from './hooks/useTimeEntryForm';
import { useEntityData } from './hooks/useEntityData';
import { ReceiptUploadDialog } from './dialogs/ReceiptDialog';
import TimeEntryFormFields from './form/TimeEntryFormFields';

interface TimeEntryFormProps {
  onSuccess: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onSuccess }) => {
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedEmployeeRate, setSelectedEmployeeRate] = useState<number | null>(null);
  const [newTimeEntryId, setNewTimeEntryId] = useState<string | null>(null);

  const {
    form,
    isLoading,
    showConfirmDialog,
    setShowConfirmDialog,
    confirmationData,
    handleSubmit,
    confirmSubmit
  } = useTimeEntryForm(onSuccess);

  const {
    workOrders,
    projects,
    employees,
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);

  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');

  // Handle receipt upload success
  const handleReceiptUploadSuccess = async (timeEntryId: string, documentId: string) => {
    try {
      // Update the time entry to mark it as having receipts
      const { error } = await supabase
        .from('time_entries')
        .update({ has_receipts: true })
        .eq('id', timeEntryId);
        
      if (error) throw error;
      
      setShowReceiptUpload(false);
      toast({
        title: "Receipt uploaded",
        description: "Your receipt has been added to this time entry."
      });
      
      // Redirect to the time entries list
      onSuccess();
    } catch (error) {
      console.error("Error updating time entry with receipt:", error);
      toast({
        title: "Error",
        description: "Failed to link receipt to time entry.",
        variant: "destructive"
      });
    }
  };

  // Handle confirmation with receipt
  const handleConfirmWithReceipt = () => {
    // First submit the time entry
    confirmSubmit().then((timeEntryId) => {
      if (timeEntryId) {
        setNewTimeEntryId(timeEntryId);
        setShowConfirmDialog(false);
        setShowReceiptUpload(true);
      }
    });
  };

  // Handle confirmation without receipt
  const handleConfirmWithoutReceipt = () => {
    confirmSubmit().then(() => {
      onSuccess();
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Log Time</CardTitle>
        </CardHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <TimeEntryFormFields
            form={form}
            workOrders={workOrders}
            projects={projects}
            employees={employees}
            isLoadingEntities={isLoadingEntities}
            getSelectedEntityDetails={getSelectedEntityDetails}
            selectedEmployeeRate={selectedEmployeeRate}
            setSelectedEmployeeRate={setSelectedEmployeeRate}
          />
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Submit Time Entry'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        confirmationData={confirmationData}
        employees={employees}
        entityType={entityType}
        workOrders={workOrders}
        projects={projects}
        isLoading={isLoading}
        onConfirmWithReceipt={handleConfirmWithReceipt}
        onConfirmWithoutReceipt={handleConfirmWithoutReceipt}
      />

      {showReceiptUpload && newTimeEntryId && (
        <ReceiptUploadDialog
          open={showReceiptUpload}
          timeEntry={{
            id: newTimeEntryId,
            entity_id: entityId,
            entity_type: entityType,
            date_worked: form.watch('workDate').toISOString()
          } as any}
          onSuccess={(timeEntryId, documentId) => handleReceiptUploadSuccess(timeEntryId, documentId)}
          onCancel={() => {
            setShowReceiptUpload(false);
            onSuccess();
          }}
        />
      )}
    </div>
  );
};

export default TimeEntryForm;
