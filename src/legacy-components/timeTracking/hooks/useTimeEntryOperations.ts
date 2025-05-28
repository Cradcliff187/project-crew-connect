import { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useTimeEntryOperations = (onSuccess: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<TimeEntry | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  // Start delete process
  const startDelete = (entry: TimeEntry) => {
    setEntryToDelete(entry);
    setShowDeleteDialog(true);
  };

  // Complete delete process
  const confirmDelete = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);

    try {
      // Delete any related expense entries
      await supabase.from('expenses').delete().eq('time_entry_id', entryToDelete.id);

      // Delete any document links
      await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('time_entry_id', entryToDelete.id);

      // Delete the time entry
      const { error } = await supabase.from('time_entries').delete().eq('id', entryToDelete.id);

      if (error) throw error;

      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been successfully removed.',
      });

      setShowDeleteDialog(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Failed to delete',
        description: 'An error occurred while trying to delete the time entry.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
    }
  };

  // Start edit process
  const startEdit = (entry: TimeEntry) => {
    setEntryToEdit(entry);
    setShowEditDialog(true);
  };

  // Complete edit process
  const saveEdit = async (updatedEntry: TimeEntry) => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          start_time: updatedEntry.start_time,
          end_time: updatedEntry.end_time,
          hours_worked: updatedEntry.hours_worked,
          notes: updatedEntry.notes,
          employee_id: updatedEntry.employee_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedEntry.id);

      if (error) throw error;

      // Update related expense if it exists
      try {
        const { data: expenses, error: expenseError } = await supabase
          .from('expenses')
          .select('id') // Use 'id' instead of 'expense_id'
          .eq('time_entry_id', updatedEntry.id)
          .eq('expense_type', 'LABOR');

        if (expenseError) {
          console.error('Error fetching expenses:', expenseError);
        } else if (expenses && expenses.length > 0) {
          // Get employee rate
          let hourlyRate = 75; // Default rate
          if (updatedEntry.employee_id) {
            const { data: employee } = await supabase
              .from('employees')
              .select('hourly_rate')
              .eq('employee_id', updatedEntry.employee_id)
              .maybeSingle();

            if (employee?.hourly_rate) {
              hourlyRate = employee.hourly_rate;
            }
          }

          // Calculate new cost
          const totalCost = updatedEntry.hours_worked * hourlyRate;

          // Update expense - Properly handle the expense ID
          const expenseId = expenses[0]?.id; // Use 'id' instead of 'expense_id'
          if (expenseId) {
            await supabase
              .from('expenses')
              .update({
                amount: totalCost,
                quantity: updatedEntry.hours_worked,
                unit_price: hourlyRate,
                description: `Labor: ${updatedEntry.hours_worked} hours`,
                updated_at: new Date().toISOString(),
              })
              .eq('id', expenseId); // Use 'id' instead of 'expense_id'
          }
        }
      } catch (innerError) {
        console.error('Error updating related expense:', innerError);
        // Continue execution despite this error
      }

      toast({
        title: 'Time entry updated',
        description: 'The time entry has been successfully updated.',
      });

      setShowEditDialog(false);
      onSuccess();
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Failed to update',
        description: 'An error occurred while trying to update the time entry.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setEntryToEdit(null);
    }
  };

  return {
    isDeleting,
    entryToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    startDelete,
    confirmDelete,
    isSaving,
    entryToEdit,
    showEditDialog,
    setShowEditDialog,
    startEdit,
    saveEdit,
  };
};
