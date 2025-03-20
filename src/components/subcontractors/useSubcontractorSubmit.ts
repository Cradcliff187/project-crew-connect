
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
      if (isEditing) {
        // Ensure subid is available for updating
        if (!data.subid) {
          throw new Error('Subcontractor ID is missing. Cannot update subcontractor.');
        }
        
        console.log('Updating subcontractor with ID:', data.subid);
        
        try {
          // 1. Update basic subcontractor info
          const { error } = await supabase
            .from('subcontractors')
            .update({
              subname: data.subname,
              contactemail: data.contactemail,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              zip: data.zip,
              status: data.status,
              specialty_ids: data.specialty_ids, // Keeping for backward compatibility
              // Financial info
              payment_terms: data.payment_terms,
              hourly_rate: data.hourly_rate,
              // Notes
              notes: data.notes,
              updated_at: new Date().toISOString(),
            })
            .eq('subid', data.subid);
          
          if (error) throw error;
          
          // 2. Update compliance information
          const complianceData = {
            insurance_expiration: data.insurance_expiration,
            insurance_provider: data.insurance_provider,
            insurance_policy_number: data.insurance_policy_number,
            contract_on_file: data.contract_on_file,
            contract_expiration: data.contract_expiration,
            tax_id: data.tax_id,
            last_performance_review: data.last_performance_review,
          };
          
          // Check if compliance record exists first
          const { data: existingCompliance, error: complianceCheckError } = await supabase
            .from('subcontractor_compliance')
            .select('id')
            .eq('subcontractor_id', data.subid)
            .maybeSingle();
            
          if (complianceCheckError) throw complianceCheckError;
          
          if (existingCompliance) {
            // Update existing compliance record
            const { error: complianceUpdateError } = await supabase
              .from('subcontractor_compliance')
              .update(complianceData)
              .eq('id', existingCompliance.id);
              
            if (complianceUpdateError) throw complianceUpdateError;
          } else {
            // Insert new compliance record
            const { error: complianceInsertError } = await supabase
              .from('subcontractor_compliance')
              .insert({
                ...complianceData,
                subcontractor_id: data.subid,
              });
              
            if (complianceInsertError) throw complianceInsertError;
          }
          
          // 3. Update performance information
          const performanceData = {
            rating: data.rating,
            on_time_percentage: data.on_time_percentage,
            quality_score: data.quality_score,
            safety_incidents: data.safety_incidents,
            response_time_hours: data.response_time_hours,
            notes: data.notes,
          };
          
          // Check if performance record exists first
          const { data: existingPerformance, error: performanceCheckError } = await supabase
            .from('subcontractor_performance')
            .select('id')
            .eq('subcontractor_id', data.subid)
            .maybeSingle();
            
          if (performanceCheckError) throw performanceCheckError;
          
          if (existingPerformance) {
            // Update existing performance record
            const { error: performanceUpdateError } = await supabase
              .from('subcontractor_performance')
              .update(performanceData)
              .eq('id', existingPerformance.id);
              
            if (performanceUpdateError) throw performanceUpdateError;
          } else {
            // Insert new performance record
            const { error: performanceInsertError } = await supabase
              .from('subcontractor_performance')
              .insert({
                ...performanceData,
                subcontractor_id: data.subid,
              });
              
            if (performanceInsertError) throw performanceInsertError;
          }
          
          // 4. Handle specialties
          // First, delete existing specialty junctions
          const { error: deleteSpecialtiesError } = await supabase
            .from('subcontractor_specialty_junction')
            .delete()
            .eq('subcontractor_id', data.subid);
            
          if (deleteSpecialtiesError) throw deleteSpecialtiesError;
          
          // Then insert new specialties
          if (data.specialty_ids && data.specialty_ids.length > 0) {
            const specialtyJunctions = data.specialty_ids.map(specialtyId => ({
              subcontractor_id: data.subid,
              specialty_id: specialtyId,
            }));
            
            const { error: insertSpecialtiesError } = await supabase
              .from('subcontractor_specialty_junction')
              .insert(specialtyJunctions);
              
            if (insertSpecialtiesError) throw insertSpecialtiesError;
          }
          
        } catch (innerError) {
          // Log the error
          console.error('Error during update operation:', innerError);
          throw innerError;
        }
        
        console.log('Successfully updated subcontractor');
      } else {
        // Generate a unique ID for the subcontractor - Now using SUB-XXXXXX format
        const { data: subcontractorIdData, error: subcontractorIdError } = await supabase
          .rpc('generate_subcontractor_id');
        
        if (subcontractorIdError) {
          console.error('Error generating subcontractor ID:', subcontractorIdError);
          throw subcontractorIdError;
        }
        
        const subcontractorId = subcontractorIdData;
        console.log('Generated new subcontractor ID (SUB-XXXXXX format):', subcontractorId);
        
        try {
          // 1. Insert the basic subcontractor information
          const { error } = await supabase
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
              specialty_ids: data.specialty_ids, // Keeping for backward compatibility
              // Financial info
              payment_terms: data.payment_terms,
              hourly_rate: data.hourly_rate,
              // Notes
              notes: data.notes,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          
          if (error) throw error;
          
          // 2. Insert compliance information
          const { error: complianceError } = await supabase
            .from('subcontractor_compliance')
            .insert({
              subcontractor_id: subcontractorId,
              insurance_expiration: data.insurance_expiration,
              insurance_provider: data.insurance_provider,
              insurance_policy_number: data.insurance_policy_number,
              contract_on_file: data.contract_on_file,
              contract_expiration: data.contract_expiration,
              tax_id: data.tax_id,
              last_performance_review: data.last_performance_review,
            });
            
          if (complianceError) throw complianceError;
          
          // 3. Insert performance information
          const { error: performanceError } = await supabase
            .from('subcontractor_performance')
            .insert({
              subcontractor_id: subcontractorId,
              rating: data.rating,
              on_time_percentage: data.on_time_percentage,
              quality_score: data.quality_score,
              safety_incidents: data.safety_incidents,
              response_time_hours: data.response_time_hours,
              notes: data.notes,
            });
            
          if (performanceError) throw performanceError;
          
          // 4. Insert specialty junctions
          if (data.specialty_ids && data.specialty_ids.length > 0) {
            const specialtyJunctions = data.specialty_ids.map(specialtyId => ({
              subcontractor_id: subcontractorId,
              specialty_id: specialtyId,
            }));
            
            const { error: specialtiesError } = await supabase
              .from('subcontractor_specialty_junction')
              .insert(specialtyJunctions);
              
            if (specialtiesError) throw specialtiesError;
          }
          
        } catch (innerError) {
          // Log error
          console.error('Error during insert operation:', innerError);
          throw innerError;
        }
        
        console.log('Successfully created subcontractor');
      }
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} subcontractor:`, error);
      throw error;
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
