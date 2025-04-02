
import { supabase } from '@/integrations/supabase/client';

/**
 * Updates a contact's status and logs the status change in history
 * @param contactId The ID of the contact to update
 * @param newStatus The new status to set
 * @returns Success boolean
 */
export const updateContactStatus = async (contactId: string, newStatus: string): Promise<boolean> => {
  try {
    // First, get the current status to record in history
    const { data: currentData, error: fetchError } = await supabase
      .from('contacts')
      .select('status')
      .eq('id', contactId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current contact status:', fetchError);
      return false;
    }
    
    const previousStatus = currentData?.status;
    
    // Update the contact status
    const { error: updateError } = await supabase
      .from('contacts')
      .update({ status: newStatus })
      .eq('id', contactId);
    
    if (updateError) {
      console.error('Error updating contact status:', updateError);
      return false;
    }
    
    // Log the status change in history
    const { error: historyError } = await supabase
      .from('contact_status_history')
      .insert({
        contact_id: contactId,
        previous_status: previousStatus,
        status: newStatus,
        changed_by: null, // Can be updated to use authenticated user
        notes: `Status changed from ${previousStatus || 'none'} to ${newStatus}`
      });
    
    if (historyError) {
      console.error('Error logging status history:', historyError);
      // We don't return false here since the status was updated successfully
    }
    
    console.log(`Contact status updated from ${previousStatus} to ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error in updateContactStatus:', error);
    return false;
  }
};
