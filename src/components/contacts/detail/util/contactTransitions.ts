
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/pages/Contacts';

// Function to update contact status with proper transitions
export const updateContactStatus = async (
  contactId: string, 
  newStatus: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)
      .select('*')
      .single();

    if (error) throw error;
    
    // Log the status change to activity log if needed
    await logStatusChange(contactId, newStatus);
    
    return true;
  } catch (error: any) {
    console.error("Error updating contact status:", error);
    toast({
      title: "Status Update Failed",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Log status changes to activity log
const logStatusChange = async (contactId: string, newStatus: string) => {
  try {
    await supabase
      .from('activitylog')
      .insert({
        action: 'Status Change',
        moduletype: 'CONTACTS',
        referenceid: contactId,
        status: newStatus,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging status change:", error);
  }
};

// Function to handle contact type transition with proper status updates
export const transitionContactType = async (
  contact: Contact,
  newType: 'client' | 'customer' | 'supplier' | 'subcontractor' | 'employee'
): Promise<boolean> => {
  try {
    // Determine appropriate default status for the new type
    const newStatus = getDefaultStatusForType(newType);
    
    const { data, error } = await supabase
      .from('contacts')
      .update({
        contact_type: newType,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', contact.id)
      .select('*')
      .single();

    if (error) throw error;
    
    // Log the type transition
    await logTypeTransition(contact.id, contact.type, newType);
    
    return true;
  } catch (error: any) {
    console.error("Error transitioning contact type:", error);
    toast({
      title: "Type Transition Failed",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
};

// Get default status for a contact type
export const getDefaultStatusForType = (type: string): string => {
  switch (type) {
    case 'client':
    case 'customer':
      return 'PROSPECT';
    case 'supplier':
      return 'POTENTIAL';
    case 'subcontractor':
      return 'PENDING';
    case 'employee':
      return 'ACTIVE';
    default:
      return '';
  }
};

// Log type transitions to activity log
const logTypeTransition = async (
  contactId: string, 
  previousType: string,
  newType: string
) => {
  try {
    await supabase
      .from('activitylog')
      .insert({
        action: 'Type Change',
        moduletype: 'CONTACTS',
        referenceid: contactId,
        status: newType,
        previousstatus: previousType,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging type transition:", error);
  }
};
