
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/pages/Contacts';
import { toast } from '@/hooks/use-toast';

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

/**
 * Transitions a contact from one type to another
 * This may affect status values and related records
 * @param contact The contact to transition
 * @param newType The new contact type
 * @returns Success boolean
 */
export const transitionContactType = async (contact: Contact, newType: string): Promise<boolean> => {
  try {
    if (contact.type === newType) {
      console.log('Contact is already of this type, no transition needed');
      return true;
    }
    
    // Determine the default status for the new type
    let defaultStatus = 'ACTIVE';
    
    switch (newType) {
      case 'client':
      case 'customer':
        defaultStatus = 'PROSPECT';
        break;
      case 'supplier':
        defaultStatus = 'POTENTIAL';
        break;
      case 'subcontractor':
        defaultStatus = 'PENDING';
        break;
      case 'employee':
        defaultStatus = 'ACTIVE';
        break;
    }
    
    // Update contact with new type and default status
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        contact_type: newType,
        status: defaultStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', contact.id);
    
    if (updateError) {
      console.error('Error updating contact type:', updateError);
      toast({
        title: "Update Failed",
        description: "Failed to update contact type. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    // Log type transition in history
    const { error: historyError } = await supabase
      .from('contact_status_history')
      .insert({
        contact_id: contact.id,
        previous_status: contact.status,
        status: defaultStatus,
        changed_by: null,
        notes: `Contact type changed from ${contact.type} to ${newType}. Status reset to ${defaultStatus}.`
      });
    
    if (historyError) {
      console.error('Error logging type transition:', historyError);
      // We don't return false since the type was updated successfully
    }
    
    console.log(`Contact type updated from ${contact.type} to ${newType}`);
    return true;
  } catch (error) {
    console.error('Error in transitionContactType:', error);
    toast({
      title: "Error",
      description: "Failed to update contact type. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};
