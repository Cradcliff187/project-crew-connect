import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import ExpenseFormFields from './components/ExpenseFormFields';
import { useExpenseForm } from './hooks/useExpenseForm';

interface ExpenseFormDialogProps {
  projectId: string;
  expense: any | null;
  onSave: () => void;
  onCancel: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
  projectId,
  expense,
  onSave,
  onCancel,
  open,
  onOpenChange,
}) => {
  const {
    form,
    budgetItems,
    vendors,
    showDocumentUpload,
    setShowDocumentUpload,
    onSubmit,
    handleDocumentUploaded,
    isEditing,
    requireTimeEntryForLabor,
    isLoadingSettings,
  } = useExpenseForm({ projectId, expense, onSave });

  const handleCancel = () => {
    onOpenChange(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        </DialogHeader>

        {showDocumentUpload ? (
          <div className="mt-4">
            <EnhancedDocumentUpload
              entityType="PROJECT"
              entityId={projectId}
              isReceiptUpload={true}
              onSuccess={documentId => documentId && handleDocumentUploaded(documentId)}
              onCancel={() => setShowDocumentUpload(false)}
            />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <ExpenseFormFields
                form={form}
                budgetItems={budgetItems}
                vendors={vendors}
                onAttachReceipt={() => setShowDocumentUpload(true)}
                hasAttachedReceipt={!!form.watch('document_id')}
                requireTimeEntryForLabor={requireTimeEntryForLabor}
                isLoadingSettings={isLoadingSettings}
              />

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                  {isEditing ? 'Update' : 'Add'} Expense
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseFormDialog;
