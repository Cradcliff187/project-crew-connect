
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubcontractorFormData } from './SubcontractorForm';

export const useSubcontractorSubmit = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: SubcontractorFormData) => {
    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the subcontractor
      const { data: subcontractorIdData, error: subcontractorIdError } = await supabase
        .rpc('generate_subcontractor_id');
      
      if (subcontractorIdError) {
        throw subcontractorIdError;
      }
      
      const subcontractorId = subcontractorIdData;
      
      // Now insert the subcontractor with the pre-generated ID
      const { data: subcontractor, error } = await supabase
        .from('subcontractors')
        .insert({
          subid: subcontractorId,
          subname: data.subname,
          contactemail: data.contactemail,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          status: data.status,
          created_at: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Subcontractor created successfully',
        description: `${data.subname} has been added to your subcontractors.`,
      });
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error('Error creating subcontractor:', error);
      toast({
        title: 'Error creating subcontractor',
        description: error.message || 'There was an error creating the subcontractor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    handleSubmit,
  };
};
