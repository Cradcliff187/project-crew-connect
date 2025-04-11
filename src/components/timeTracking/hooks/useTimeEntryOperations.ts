
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types/timeTracking';
import { toast } from '@/hooks/use-toast';

export function useTimeEntryOperations(onEntryChange: () => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<TimeEntry | null>(null);
  
  // Dialog visibility states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Delete operations
  const startDelete = (entry: TimeEntry) => {
    setEntryToDelete(entry);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Check if there are receipts attached to this time entry
      if (entryToDelete.has_receipts) {
        // First delete the document links
        const { error: linkError } = await supabase
          .from('time_entry_document_links')
          .delete()
          .eq('time_entry_id', entryToDelete.id);
        
        if (linkError) throw linkError;
      }
      
      // Delete any associated expenses if they exist
      const { error: expenseError } = await supabase
        .from('expenses')
        .delete()
        .eq('time_entry_id', entryToDelete.id);
      
      if (expenseError) {
        console.error('Error deleting linked expenses:', expenseError);
        // Continue even if expense deletion fails
      }
      
      // Now delete the time entry
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been successfully removed.'
      });
      
      onEntryChange(); // Refresh the list
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete time entry.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Edit operations
  const startEdit = (entry: TimeEntry) => {
    setEntryToEdit(entry);
    setShowEditDialog(true);
  };
  
  const saveEdit = async (updatedEntry: TimeEntry) => {
    setIsSaving(true);
    
    try {
      // Update the time entry
      // Note: We don't need to manually set hours_worked as the database trigger calculate_hours_worked
      // will automatically calculate it based on start_time and end_time
      // Similarly, calculate_time_entry_total_cost will update the total_cost based on hours and rate
      const { error } = await supabase
        .from('time_entries')
        .update({
          start_time: updatedEntry.start_time,
          end_time: updatedEntry.end_time,
          // Note: hours_worked will be calculated by the database trigger
          notes: updatedEntry.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedEntry.id);
      
      if (error) throw error;
      
      toast({
        title: 'Time entry updated',
        description: 'Your changes have been saved successfully.'
      });
      
      onEntryChange(); // Refresh the list
      setShowEditDialog(false);
    } catch (error: any) {
      console.error('Error updating time entry:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update time entry.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    // Delete state and functions
    isDeleting,
    entryToDelete,
    showDeleteDialog,
    setShowDeleteDialog,
    startDelete,
    confirmDelete,
    
    // Edit state and functions
    isSaving,
    entryToEdit,
    showEditDialog,
    setShowEditDialog,
    startEdit,
    saveEdit
  };
}
