
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface ContactRelationship {
  id: string;
  from_contact_id: string;
  to_contact_id: string;
  relationship_type: string;
  notes?: string;
  created_at: string;
}

// Fetch relationships for a contact (both directions)
export const fetchContactRelationships = async (contactId: string): Promise<ContactRelationship[]> => {
  try {
    // Fetch relationships where the contact is either the source or target
    const { data: fromRelationships, error: fromError } = await supabase
      .from('contact_relationships')
      .select('*')
      .eq('from_contact_id', contactId);
      
    const { data: toRelationships, error: toError } = await supabase
      .from('contact_relationships')
      .select('*')
      .eq('to_contact_id', contactId);
    
    if (fromError || toError) {
      throw fromError || toError;
    }
    
    // Combine both sets of relationships
    return [...(fromRelationships || []), ...(toRelationships || [])];
  } catch (error: any) {
    console.error("Error fetching contact relationships:", error);
    toast({
      title: "Error",
      description: "Failed to load contact relationships.",
      variant: "destructive"
    });
    return [];
  }
};

// Add a new relationship between contacts
export const addContactRelationship = async (
  fromContactId: string,
  toContactId: string,
  relationshipType: string,
  notes?: string
): Promise<ContactRelationship | null> => {
  try {
    const { data, error } = await supabase
      .from('contact_relationships')
      .insert({
        from_contact_id: fromContactId,
        to_contact_id: toContactId,
        relationship_type: relationshipType,
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
      
    if (error) throw error;
    
    toast({
      title: "Relationship Added",
      description: "Contact relationship has been successfully created."
    });
    
    return data;
  } catch (error: any) {
    console.error("Error adding contact relationship:", error);
    toast({
      title: "Error",
      description: "Failed to create contact relationship.",
      variant: "destructive"
    });
    return null;
  }
};

// Remove a relationship
export const removeContactRelationship = async (relationshipId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('contact_relationships')
      .delete()
      .eq('id', relationshipId);
      
    if (error) throw error;
    
    toast({
      title: "Relationship Removed",
      description: "Contact relationship has been successfully removed."
    });
    
    return true;
  } catch (error: any) {
    console.error("Error removing contact relationship:", error);
    toast({
      title: "Error",
      description: "Failed to remove contact relationship.",
      variant: "destructive"
    });
    return false;
  }
};

// Get relationship type options
export const getRelationshipTypeOptions = () => [
  { value: 'EMPLOYER', label: 'Employer' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'SUPPLIER', label: 'Supplier' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'AFFILIATE', label: 'Affiliate' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'SUBCONTRACTOR', label: 'Subcontractor' }
];
