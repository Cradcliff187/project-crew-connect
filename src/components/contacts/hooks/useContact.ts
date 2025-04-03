
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Contact {
  contact_id: string;
  full_name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contact_type: string;
  role?: string;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  specialty?: string;
  rating?: number;
  hourly_rate?: number;
  materials?: string;
}

export function useContact(contactId?: string) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const fetchContact = async () => {
    if (!contactId) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (error) {
        console.error('Error fetching contact:', error);
        setNotFound(true);
        return;
      }
      
      if (!data) {
        setNotFound(true);
        return;
      }
      
      // Transform the data to match our Contact interface
      setContact({
        contact_id: data.id,
        full_name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        contact_type: data.contact_type,
        role: data.role,
        status: data.status,
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
        specialty: data.specialty,
        rating: data.rating,
        hourly_rate: data.hourly_rate,
        materials: data.materials
      });
      
      setNotFound(false);
    } catch (error) {
      console.error('Error fetching contact:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContact();
  }, [contactId]);
  
  const refreshContact = () => {
    fetchContact();
  };
  
  return {
    contact,
    loading,
    notFound,
    refreshContact
  };
}
