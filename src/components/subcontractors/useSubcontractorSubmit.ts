import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubcontractorFormData } from './types/formTypes';

export const useSubcontractorSubmit = (onSuccess: () => void, isEditing = false) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: SubcontractorFormData) => {
    setIsSubmitting(true);
    console.log('Processing submission:', data);

    try {
      // All data now goes into a single table
      const submissionData = {
        subname: data.subname,
        contactemail: data.contactemail,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        status: data.status,
        specialty_ids: data.specialty_ids,
        // Financial info
        payment_terms: data.payment_terms,
        hourly_rate: data.hourly_rate,
        tax_id: data.tax_id,
        // Compliance info
        insurance_expiration: data.insurance_expiration,
        insurance_provider: data.insurance_provider,
        insurance_policy_number: data.insurance_policy_number,
        contract_on_file: data.contract_on_file,
        contract_expiration: data.contract_expiration,
        // Notes
        notes: data.notes,
        // Preferred flag
        preferred: data.preferred,
      };

      if (isEditing) {
        // Ensure subid is available for updating
        if (!data.subid) {
          throw new Error('Subcontractor ID is missing. Cannot update subcontractor.');
        }

        console.log('Updating subcontractor with ID:', data.subid);

        // Update subcontractor in the consolidated table
        const { error } = await supabase
          .from('subcontractors')
          .update({
            ...submissionData,
            updated_at: new Date().toISOString(),
          })
          .eq('subid', data.subid);

        if (error) {
          console.error('Error updating subcontractor:', error);
          throw error;
        }

        console.log('Successfully updated subcontractor');
        toast({
          title: 'Subcontractor updated',
          description: 'The subcontractor has been updated successfully.',
        });
      } else {
        // Generate a unique ID for the subcontractor - Now using SUB-XXXXXX format
        const { data: subcontractorIdData, error: subcontractorIdError } = await supabase.rpc(
          'generate_subcontractor_id'
        );

        if (subcontractorIdError) {
          console.error('Error generating subcontractor ID:', subcontractorIdError);
          throw subcontractorIdError;
        }

        const subcontractorId = subcontractorIdData;
        console.log('Generated new subcontractor ID:', subcontractorId);

        // Insert the subcontractor in the consolidated table
        const { error } = await supabase.from('subcontractors').insert({
          ...submissionData,
          subid: subcontractorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error creating subcontractor:', error);
          throw error;
        }

        console.log('Successfully created subcontractor');
        toast({
          title: 'Subcontractor added',
          description: 'The subcontractor has been created successfully.',
        });
      }

      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} subcontractor:`, error);
      toast({
        title: `Error ${isEditing ? 'updating' : 'creating'} subcontractor`,
        description:
          error.message ||
          `There was an error ${isEditing ? 'updating' : 'creating'} the subcontractor. Please try again.`,
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

export default useSubcontractorSubmit;
