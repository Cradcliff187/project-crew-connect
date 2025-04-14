import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ContactInteraction {
  id: string;
  contact_id: string;
  interaction_type: string;
  subject: string;
  notes?: string;
  interaction_date: string;
  created_by?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  status: string;
  created_at: string;
}

// Fetch interactions for a contact
export const fetchContactInteractions = async (
  contactId: string
): Promise<ContactInteraction[]> => {
  try {
    const { data, error } = await supabase
      .from('contact_interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('interaction_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error('Error fetching contact interactions:', error);
    toast({
      title: 'Error',
      description: 'Failed to load contact interactions.',
      variant: 'destructive',
    });
    return [];
  }
};

// Add a new interaction
export const addContactInteraction = async (
  interaction: Omit<ContactInteraction, 'id' | 'created_at'>
): Promise<ContactInteraction | null> => {
  try {
    const { data, error } = await supabase
      .from('contact_interactions')
      .insert({
        ...interaction,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    // Update the last_contact field in the contacts table
    await supabase
      .from('contacts')
      .update({
        last_contact: interaction.interaction_date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', interaction.contact_id);

    toast({
      title: 'Interaction Added',
      description: 'Contact interaction has been successfully added.',
    });

    return data;
  } catch (error: any) {
    console.error('Error adding contact interaction:', error);
    toast({
      title: 'Error',
      description: 'Failed to add contact interaction.',
      variant: 'destructive',
    });
    return null;
  }
};

// Update an interaction
export const updateContactInteraction = async (
  id: string,
  updates: Partial<ContactInteraction>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contact_interactions')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    toast({
      title: 'Interaction Updated',
      description: 'Contact interaction has been successfully updated.',
    });

    return true;
  } catch (error: any) {
    console.error('Error updating contact interaction:', error);
    toast({
      title: 'Error',
      description: 'Failed to update contact interaction.',
      variant: 'destructive',
    });
    return false;
  }
};

// Get interaction type options
export const getInteractionTypeOptions = () => [
  { value: 'CALL', label: 'Phone Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'NOTE', label: 'Note' },
  { value: 'TASK', label: 'Task' },
];

// Get status options for interactions
export const getInteractionStatusOptions = (type: string) => {
  if (type === 'TASK') {
    return [
      { value: 'PLANNED', label: 'Planned' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' },
    ];
  }

  return [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];
};
